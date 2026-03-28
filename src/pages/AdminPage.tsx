import React, { useState, useEffect } from "react";
import { 
  Users, 
  ShieldCheck, 
  Trash2, 
  UserX,
  UserCheck,
  Search,
  Loader2,
  Mail,
  Calendar
} from "lucide-react";
import { getAllUsers, deleteUser, assignRole } from "../api/user.api";
import { User } from "../types/user";

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRoles: string[], role: string) => {
    let newRoles: string[];
    if (currentRoles.includes(role)) {
      newRoles = currentRoles.filter(r => r !== role);
    } else {
      newRoles = [...currentRoles, role];
    }
    
    if (newRoles.length === 0) newRoles = ["USER"];

    setIsProcessing(userId);
    try {
      const updated = await assignRole(userId, newRoles);
      setUsers(users.map(u => u.id === userId ? updated : u));
    } catch (error) {
      alert("Không thể thay đổi quyền hạn.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    setIsProcessing(userId);
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      alert("Không thể xóa người dùng.");
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-blue-600" /> Bảng điều trị Admin
          </h1>
          <p className="text-gray-500 font-medium mt-1">Quản lý người dùng và quyền hạn hệ thống.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm người dùng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Người dùng</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Quyền hạn</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Ngày tạo</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-50 flex items-center justify-center text-blue-600 font-black text-xs uppercase shadow-sm">
                        {u.fullName.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{u.fullName}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {["USER", "MANAGER", "ADMIN"].map(role => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(u.id, u.roles, role)}
                          disabled={isProcessing === u.id}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-black transition-all ${
                            u.roles.includes(role)
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                      {u.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {u.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Calendar className="h-3.5 w-3.5 text-blue-400" />
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={isProcessing === u.id}
                      className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Không tìm thấy người dùng phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
