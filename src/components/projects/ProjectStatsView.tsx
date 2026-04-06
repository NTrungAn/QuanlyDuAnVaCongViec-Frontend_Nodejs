import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  KanbanSquare,
  Layers3,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react';
import { getProjectStats, getMemberPerformanceReport, getProjectTimelineReport } from '../../api/stat.api';
import { getTasksByProject } from '../../api/task.api';
import { getSprintsByProject } from '../../api/sprint.api';
import { getEpicsByProject } from '../../api/epic.api';
import { getNotifications } from '../../api/notification.api';
import type { ProjectStats, PerformanceReport } from '../../types/stat';
import type { Task, TaskEntityRef } from '../../types/task';
import type { Sprint } from '../../types/sprint';
import type { Epic } from '../../types/epic';
import type { NotificationItem } from '../../types/notification';

interface ProjectStatsViewProps {
  projectId: string;
}

type StatsTab = 'summary' | 'timeline';
type RangeOption = 7 | 30 | 90;

const STATUS_META = {
  TODO: { label: 'To do', color: '#F59E0B' },
  IN_PROGRESS: { label: 'In progress', color: '#3B82F6' },
  REVIEW: { label: 'In testing', color: '#84CC16' },
  DONE: { label: 'Done', color: '#8B5CF6' },
} as const;

const PRIORITY_ORDER = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;
const PRIORITY_META = {
  URGENT: { label: 'Highest', color: '#DC2626' },
  HIGH: { label: 'High', color: '#F97316' },
  MEDIUM: { label: 'Medium', color: '#F59E0B' },
  LOW: { label: 'Low', color: '#3B82F6' },
} as const;

const getEntityId = (value: TaskEntityRef) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.id || value._id || null;
};


const isWithinDays = (value: string | undefined, days: number) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

const daysAgo = (value: string | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
  return diffDays;
};

const getActivityText = (item: NotificationItem) => {
  if (item.message) return item.message;
  return 'Có cập nhật mới trong dự án';
};

const getTaskWorkType = (task: Task) => {
  if (task.parentTask) return 'Sub-task';
  if (task.taskType?.name) return task.taskType.name;
  if (task.epic) return 'Story';
  return 'Task';
};

const clamp = (num: number, min: number, max: number) => Math.min(max, Math.max(min, num));

const TimelineSprintBadge: React.FC<{ sprint: Sprint }> = ({ sprint }) => {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
      {sprint.name}
    </span>
  );
};

const ProjectStatsView: React.FC<ProjectStatsViewProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<StatsTab>('summary');
  const [range, setRange] = useState<RangeOption>(7);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceReport | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [timelineWindowStart, setTimelineWindowStart] = useState<Date | null>(null);
  const [timelineWindowEnd, setTimelineWindowEnd] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsData, perfData, taskData, sprintData, epicData, notificationData, timelineData] = await Promise.all([
          getProjectStats(projectId),
          getMemberPerformanceReport(projectId).catch(() => null),
          getTasksByProject(projectId),
          getSprintsByProject(projectId),
          getEpicsByProject(projectId),
          getNotifications().catch(() => []),
          getProjectTimelineReport(projectId).catch(() => null),
        ]);

        setProjectStats(statsData);
        setPerformance(perfData);
        setTasks(taskData || []);
        setSprints((sprintData || []).sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate)));
        setEpics(epicData || []);
        setNotifications(
          (notificationData || []).filter((item) => item.link?.includes(`/projects/${projectId}`)).slice(0, 12),
        );

        const fallbackStart = sprintData?.length
          ? new Date(sprintData[0].startDate)
          : new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
        const fallbackEnd = sprintData?.length
          ? new Date(sprintData[sprintData.length - 1].endDate)
          : new Date(Date.now() + 75 * 24 * 60 * 60 * 1000);

        const start = timelineData?.startDate ? new Date(timelineData.startDate) : fallbackStart;
        const end = timelineData?.endDate ? new Date(timelineData.endDate) : fallbackEnd;
        setTimelineWindowStart(new Date(start.getFullYear(), start.getMonth() - 1, 1));
        setTimelineWindowEnd(new Date(end.getFullYear(), end.getMonth() + 2, 0));
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const summaryMetrics = useMemo(() => {
    const doneStatusNames = (projectStats?.statuses || [])
      .filter(s => s.category === 'DONE')
      .map(s => s.name);
      
    const isDone = (status: string) => doneStatusNames.includes(status);

    const completedRecently = tasks.filter((task) => isDone(task.status) && (daysAgo(task.updatedAt) ?? Infinity) <= range).length;
    const updatedRecently = tasks.filter((task) => (daysAgo(task.updatedAt) ?? Infinity) <= range).length;
    const createdRecently = tasks.filter((task) => (daysAgo(task.createdAt) ?? Infinity) <= range).length;
    const dueSoon = tasks.filter((task) => !isDone(task.status) && isWithinDays(task.dueDate, 7)).length;
    const overdue = tasks.filter((task) => !isDone(task.status) && task.dueDate && new Date(task.dueDate) < new Date()).length;
    return { completedRecently, updatedRecently, createdRecently, dueSoon, overdue };
  }, [tasks, range, projectStats]);

  const statusSegments = useMemo(() => {
    if (!projectStats) return [];
    
    // Nếu có danh sách statuses đính kèm, dùng nó để map
    if (projectStats?.statuses && projectStats.statuses.length > 0) {
      return projectStats.statuses.map(s => ({
        key: s.name,
        label: s.name,
        color: s.color || "#CBD5E1",
        value: (projectStats.statusCounts as any)[s.name] || 0
      }));
    }

    // Fallback sang STATUS_META nếu không có metadata từ backend
    return (Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((key) => ({
      key,
      label: STATUS_META[key].label,
      color: STATUS_META[key].color,
      value: projectStats.statusCounts[key] || 0,
    }));
  }, [projectStats]);

  const statusGradient = useMemo(() => {
    if (!projectStats || projectStats.totalTasks === 0) {
      return 'conic-gradient(#E5E7EB 0 360deg)';
    }
    let current = 0;
    const parts = statusSegments.map(({ color, value }) => {
      const percent = (value / projectStats.totalTasks) * 100;
      const start = current;
      current += percent;
      return `${color} ${start}% ${current}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }, [projectStats, statusSegments]);

  const priorityBreakdown = useMemo(() => {
    if (!projectStats) return [];
    return PRIORITY_ORDER.map((key) => ({
      key,
      count: projectStats.priorityCounts[key] || 0,
      percent: projectStats.totalTasks ? Math.round(((projectStats.priorityCounts[key] || 0) / projectStats.totalTasks) * 100) : 0,
    }));
  }, [projectStats]);

  const workTypeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((task) => {
      const key = getTaskWorkType(task);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count, percent: tasks.length ? Math.round((count / tasks.length) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [tasks]);

  const epicProgress = useMemo(() => {
    return epics.map((epic) => {
      const epicId = epic.id || epic._id || '';
      const epicTasks = tasks.filter((task) => getEntityId(task.epic) === epicId);
      const doneStatusNames = (projectStats?.statuses || [])
        .filter(s => s.category === 'DONE')
        .map(s => s.name);
      const isDone = (status: string) => doneStatusNames.includes(status);

      const done = epicTasks.filter((task) => isDone(task.status)).length;
      const progress = epicTasks.length ? Math.round((done / epicTasks.length) * 100) : 0;
      return {
        id: epicId,
        name: epic.name,
        total: epicTasks.length,
        done,
        progress,
      };
    }).sort((a, b) => b.total - a.total);
  }, [epics, tasks, projectStats]);

  const teamWorkload = useMemo(() => {
    if (!performance) return [];
    const totalAssigned = performance.memberStats.reduce((sum, member) => sum + member.totalTasks, 0) || 1;
    return performance.memberStats
      .map((member) => ({
        ...member,
        distribution: Math.round((member.totalTasks / totalAssigned) * 100),
      }))
      .sort((a, b) => b.totalTasks - a.totalTasks);
  }, [performance]);

  const recentActivity = useMemo(() => {
    const taskActivities = tasks
      .filter((task) => (daysAgo(task.updatedAt) ?? Infinity) <= range)
      .map((task) => {
        const meta = statusSegments.find(s => s.key === task.status) || 
                    (STATUS_META as any)[task.status] || 
                    { label: task.status };
        return {
          id: task.id || task._id || task.title,
          text: `Task \"${task.title}\" được cập nhật sang trạng thái ${meta.label || task.status}`,
          when: task.updatedAt || task.createdAt || new Date().toISOString(),
        };
      });

    const notificationActivities = notifications.map((item) => ({
      id: item.id,
      text: getActivityText(item),
      when: item.createdAt,
    }));

    return [...notificationActivities, ...taskActivities]
      .sort((a, b) => +new Date(b.when) - +new Date(a.when))
      .slice(0, 8);
  }, [notifications, tasks, range]);

  const timelineData = useMemo(() => {
    const start = timelineWindowStart || new Date();
    const months: Date[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const end = timelineWindowEnd || new Date(start.getFullYear(), start.getMonth() + 5, 1);
    while (cursor <= end && months.length < 12) {
      months.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const sprintRows = sprints.map((sprint) => ({
      id: sprint.id || sprint._id || sprint.name,
      name: sprint.name,
      type: 'sprint' as const,
      start: sprint.startDate,
      end: sprint.endDate,
      status: sprint.status,
    }));

    const epicRows = epicProgress.map((epic, index) => {
      const epicId = epic.id;
      const epicTasks = tasks.filter((task) => getEntityId(task.epic) === epicId);
      const dates = epicTasks.flatMap((task) => [task.createdAt, task.dueDate]).filter(Boolean) as string[];
      let startDate: Date;
      let endDate: Date;
      if (dates.length > 0) {
        startDate = new Date(Math.min(...dates.map((d) => +new Date(d))));
        endDate = new Date(Math.max(...dates.map((d) => +new Date(d))));
      } else if (sprints[index]) {
        startDate = new Date(sprints[index].startDate);
        endDate = new Date(sprints[index].endDate);
      } else {
        startDate = new Date(start.getFullYear(), start.getMonth() + index, 1);
        endDate = new Date(start.getFullYear(), start.getMonth() + index, 18);
      }
      return {
        id: `epic-${epicId}`,
        name: epic.name,
        type: 'epic' as const,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        progress: epic.progress,
      };
    });

    return { months, sprintRows, epicRows };
  }, [timelineWindowEnd, timelineWindowStart, sprints, epicProgress, tasks]);

  const shiftTimeline = (direction: -1 | 1) => {
    if (!timelineWindowStart || !timelineWindowEnd) return;
    const start = new Date(timelineWindowStart);
    const end = new Date(timelineWindowEnd);
    start.setMonth(start.getMonth() + direction);
    end.setMonth(end.getMonth() + direction);
    setTimelineWindowStart(start);
    setTimelineWindowEnd(end);
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-gray-100 bg-white">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-semibold">Đang tổng hợp thống kê dự án...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600">
        {error}
      </div>
    );
  }

  if (!projectStats) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-gray-400">Thống kê & báo cáo</p>
            <h3 className="mt-2 text-2xl font-black text-gray-900">{projectStats.projectName}</h3>
            <p className="mt-1 text-sm text-gray-500">Xem nhanh tiến độ, hiệu suất đội nhóm và timeline triển khai như bảng điều khiển Jira.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              {([
                ['summary', 'Summary'],
                ['timeline', 'Timeline'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`rounded-lg px-4 py-2 text-sm font-black transition ${
                    activeTab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
              {([7, 30, 90] as RangeOption[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setRange(value)}
                  className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                    range === value ? 'bg-violet-600 text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {value} ngày
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'summary' ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={CheckCircle2} label="completed" value={summaryMetrics.completedRecently} sublabel={`trong ${range} ngày gần nhất`} tone="emerald" />
              <MetricCard icon={RefreshCw} label="updated" value={summaryMetrics.updatedRecently} sublabel={`trong ${range} ngày gần nhất`} tone="blue" />
              <MetricCard icon={KanbanSquare} label="created" value={summaryMetrics.createdRecently} sublabel={`trong ${range} ngày gần nhất`} tone="violet" />
              <MetricCard icon={Clock3} label="due soon" value={summaryMetrics.dueSoon} sublabel="trong 7 ngày tới" tone="orange" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
              <div className="rounded-[24px] border border-gray-100 bg-white p-5">
                <SectionTitle icon={Activity} title="Status overview" subtitle="Phân bố trạng thái của toàn bộ work item trong dự án" />
                <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
                  <div className="flex items-center justify-center">
                    <div className="relative flex h-48 w-48 items-center justify-center rounded-full" style={{ background: statusGradient }}>
                      <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                        <span className="text-4xl font-black text-gray-900">{projectStats.totalTasks}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total work items</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {statusSegments.map(({ key, label, color, value }) => {
                      return (
                        <div key={key} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm font-bold text-gray-700">{label}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-gray-900">{value}</div>
                            <div className="text-[11px] font-bold text-gray-400">
                              {projectStats.totalTasks ? Math.round((value / projectStats.totalTasks) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-gray-100 bg-white p-5">
                <SectionTitle icon={RefreshCw} title="Recent activity" subtitle="Theo dõi nhanh các cập nhật mới nhất trong dự án" />
                <div className="mt-5 space-y-4">
                  {recentActivity.length === 0 ? (
                    <EmptyState text="Chưa có hoạt động nào gần đây." />
                  ) : (
                    recentActivity.map((item) => (
                      <div key={item.id} className="flex gap-3 rounded-2xl border border-gray-100 p-4">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-700">{item.text}</p>
                          <p className="mt-1 text-xs font-medium text-gray-400">{formatRelativeTime(item.when)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
              <div className="rounded-[24px] border border-gray-100 bg-white p-5">
                <SectionTitle icon={Flag} title="Priority breakdown" subtitle="Mức độ ưu tiên của công việc đang được xử lý" />
                <div className="mt-6 space-y-5">
                  {priorityBreakdown.map(({ key, count, percent }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PRIORITY_META[key].color }} />
                          {PRIORITY_META[key].label}
                        </span>
                        <span className="text-gray-800">{count}</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-100">
                        <div
                          className="h-3 rounded-full"
                          style={{ width: `${percent}%`, backgroundColor: PRIORITY_META[key].color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-gray-100 bg-white p-5">
                <SectionTitle icon={Layers3} title="Types of work" subtitle="Phân bổ công việc theo loại đang được sử dụng" />
                <div className="mt-5 space-y-4">
                  {workTypeBreakdown.length === 0 ? (
                    <EmptyState text="Chưa có dữ liệu phân loại công việc." />
                  ) : (
                    workTypeBreakdown.map((item) => (
                      <div key={item.name} className="grid grid-cols-[1fr_auto] items-center gap-3">
                        <div>
                          <div className="text-sm font-bold text-gray-700">{item.name}</div>
                          <div className="mt-2 h-3 rounded-full bg-gray-100">
                            <div className="h-3 rounded-full bg-slate-500" style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-gray-900">{item.percent}%</div>
                          <div className="text-[11px] font-medium text-gray-400">{item.count} việc</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
              <div className="rounded-[24px] border border-gray-100 bg-white p-5">
                <SectionTitle icon={Users} title="Team workload" subtitle="Theo dõi phân bổ công việc trên từng thành viên" />
                <div className="mt-5 space-y-4">
                  {teamWorkload.length === 0 ? (
                    <EmptyState text="Chỉ chủ dự án mới xem được báo cáo hiệu suất thành viên." />
                  ) : (
                    teamWorkload.map((member) => (
                      <div key={member.memberId} className="grid grid-cols-[minmax(0,1fr)_80px] gap-4 rounded-2xl border border-gray-100 p-4">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-gray-900">{member.fullName}</p>
                              <p className="truncate text-[11px] font-medium text-gray-400">{member.email}</p>
                            </div>
                            <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-black text-gray-500">
                              {member.totalTasks} việc
                            </span>
                          </div>
                          <div className="mt-3 h-3 rounded-full bg-gray-100">
                            <div className="h-3 rounded-full bg-blue-600" style={{ width: `${member.distribution}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-gray-900">{member.distribution}%</div>
                          <div className="text-[11px] font-medium text-gray-400">work distribution</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-gray-100 bg-white p-5">
                <SectionTitle icon={Layers3} title="Epic progress" subtitle="Tiến độ của từng epic ở thời điểm hiện tại" />
                <div className="mt-5 space-y-4">
                  {epicProgress.length === 0 ? (
                    <EmptyState text="Chưa có epic nào trong dự án." />
                  ) : (
                    epicProgress.map((epic) => (
                      <div key={epic.id} className="rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">{epic.name}</p>
                            <p className="text-[11px] font-medium text-gray-400">{epic.done}/{epic.total} task hoàn thành</p>
                          </div>
                          <span className="text-sm font-black text-blue-600">{epic.progress}%</span>
                        </div>
                        <div className="mt-3 h-3 rounded-full bg-gray-100">
                          <div className="h-3 rounded-full bg-blue-500" style={{ width: `${epic.progress}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <SectionTitle icon={Calendar} title="Timeline" subtitle="Theo dõi sprint và epic theo tháng giống giao diện Jira timeline." />
              <div className="flex items-center gap-2">
                <button onClick={() => shiftTimeline(-1)} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => shiftTimeline(1)} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[980px] rounded-2xl border border-gray-100">
                <div className="grid grid-cols-[280px_repeat(6,minmax(120px,1fr))] border-b border-gray-100 bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  <div className="p-3">Work</div>
                  {timelineData.months.slice(0, 6).map((month) => (
                    <div key={month.toISOString()} className="border-l border-gray-100 p-3 text-center">
                      {month.toLocaleDateString('en-US', { month: 'long' })}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-[280px_repeat(6,minmax(120px,1fr))] border-b border-gray-100 bg-white text-xs">
                  <div className="p-3 font-black text-gray-700">Sprints</div>
                  <div className="col-span-6 p-3">
                    <div className="flex flex-wrap gap-2">
                      {sprints.length === 0 ? (
                        <span className="text-xs text-gray-400">Chưa có sprint</span>
                      ) : (
                        sprints.map((sprint) => <TimelineSprintBadge key={sprint.id || sprint._id || sprint.name} sprint={sprint} />)
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[280px_repeat(6,minmax(120px,1fr))] border-b border-gray-100 bg-white text-xs">
                  <div className="p-3 font-black text-gray-700">Releases</div>
                  <div className="col-span-6 p-3 text-gray-500">Mốc release hiện được suy ra từ ngày kết thúc của sprint/project.</div>
                </div>

                {timelineData.epicRows.length === 0 ? (
                  <div className="p-6 text-sm text-gray-400">Chưa có epic để hiển thị timeline.</div>
                ) : (
                  timelineData.epicRows.map((row) => (
                    <TimelineRow key={row.id} row={row} months={timelineData.months.slice(0, 6)} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, sublabel, tone }: any) => {
  const toneMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-gray-900">{value}</p>
          <p className="mt-1 text-[12px] font-bold text-gray-500">{label}</p>
          <p className="mt-1 text-[11px] font-medium text-gray-400">{sublabel}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title, subtitle }: any) => (
  <div>
    <div className="flex items-center gap-2 text-lg font-black text-gray-900">
      <Icon className="h-5 w-5 text-blue-600" /> {title}
    </div>
    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm font-medium text-gray-400">
    {text}
  </div>
);

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không xác định';
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Vừa xong';
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

const TimelineRow: React.FC<{
  row: { id: string; name: string; type: 'epic' | 'sprint'; start: string; end: string; progress?: number; status?: string };
  months: Date[];
}> = ({ row, months }) => {
  const timelineStart = new Date(months[0].getFullYear(), months[0].getMonth(), 1).getTime();
  const timelineEnd = new Date(months[months.length - 1].getFullYear(), months[months.length - 1].getMonth() + 1, 0).getTime();
  const total = timelineEnd - timelineStart || 1;
  const start = clamp(((new Date(row.start).getTime() - timelineStart) / total) * 100, 0, 100);
  const end = clamp(((new Date(row.end).getTime() - timelineStart) / total) * 100, 0, 100);
  const width = Math.max(6, end - start);
  const barColor = row.type === 'epic' ? 'bg-[#FCA5A5]' : 'bg-[#3B82F6]';
  const labelColor = row.type === 'epic' ? 'text-violet-600' : 'text-gray-900';

  return (
    <div className="grid grid-cols-[280px_repeat(6,minmax(120px,1fr))] border-b border-gray-100 text-xs last:border-b-0">
      <div className="flex items-center gap-2 p-3">
        <span className={`font-bold ${labelColor}`}>{row.name}</span>
        {row.progress !== undefined && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600">{row.progress}%</span>
        )}
      </div>
      <div className="relative col-span-6 min-h-[58px] bg-[linear-gradient(to_right,#F3F4F6_1px,transparent_1px)] bg-[length:16.666%_100%] p-3">
        <div className={`absolute top-1/2 h-8 -translate-y-1/2 rounded-md ${barColor} shadow-sm`} style={{ left: `${start}%`, width: `${width}%` }} />
      </div>
    </div>
  );
};

export default ProjectStatsView;
