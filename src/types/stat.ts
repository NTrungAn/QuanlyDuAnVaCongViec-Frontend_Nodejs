export interface DashboardStats {
  totalProjects: number;
  totalAssignedTasks: number;
  assignedTaskStatus: {
    TODO: number;
    IN_PROGRESS: number;
    REVIEW: number;
    DONE: number;
  };
  upcomingDeadlines: Array<{
    _id: string;
    name: string;
    endDate: string;
  }>;
}

export interface ProjectStats {
  projectName: string;
  totalTasks: number;
  statusCounts: {
    TODO: number;
    IN_PROGRESS: number;
    REVIEW: number;
    DONE: number;
  };
  priorityCounts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  completionPercentage: number;
  memberCount: number;
}

export interface MemberPerformance {
  memberId: string;
  fullName: string;
  email: string;
  totalTasks: number;
  statusCounts: {
    TODO: number;
    IN_PROGRESS: number;
    REVIEW: number;
    DONE: number;
  };
  completionRate: number;
}

export interface PerformanceReport {
  projectName: string;
  memberStats: MemberPerformance[];
}

export interface TimelineStat {
  _id: string; // Date string YYYY-MM-DD
  count: number;
}

export interface TimelineReport {
  projectName: string;
  startDate: string;
  endDate: string;
  timelineStats: TimelineStat[];
}
