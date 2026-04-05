import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  LogOut
} from "lucide-react";
import { getMe, updateUser, uploadAvatar } from "../api/user.api";
import { User } from "../types/user";
import { getAvatarUrl } from "../utils/url.util";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const avatarUrl = getAvatarUrl(user?.avatarUrl);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getMe();
      setUser(data);
      setFullName(data.fullName);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const updated = await updateUser(user.id, { fullName });
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Không thể cập nhật thông tin." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await updateUser(user.id, { password });
      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Không thể đổi mật khẩu." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setMessage(null);

    try {
      const { avatarUrl } = await uploadAvatar(user.id, file);
      const updated = { ...user, avatarUrl };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setMessage({ type: "success", text: "Cập nhật ảnh đại diện thành công!" });
    } catch (error: any) {
      setMessage({ type: "error", text: "Không thể tải ảnh lên." });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
          <UserIcon className="h-40 w-40" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-inner bg-gray-50 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-16 w-16 text-gray-300" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-all shadow-lg border-2 border-white group-hover:scale-110">
              <Camera className="h-5 w-5" />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900 mb-2">{user.fullName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
                <Shield className="h-3 w-3" /> {user.roles[0]}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-bold">
                <Mail className="h-3 w-3" /> {user.email}
              </span>
            </div>
          </div>

          <div className="ml-auto mt-4 md:mt-0">
             <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-100 transition-all"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
          message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Update */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-6">
            <UserIcon className="h-5 w-5 text-blue-600" /> Thông tin cá nhân
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Họ và tên</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Nhập họ và tên..."
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Email (Không thể thay đổi)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input 
                  type="email" 
                  value={user.email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-300 cursor-not-allowed"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSaving || fullName === user.fullName}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all mt-4"
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </div>

        {/* Password Update */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-orange-500" /> Bảo mật
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                  placeholder="Nhập mật khẩu mới..."
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Xác nhận mật khẩu</label>
              <div className="relative">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                  placeholder="Xác nhận lại mật khẩu..."
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isSaving || !password || password !== confirmPassword}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 transition-all mt-4"
            >
              {isSaving ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
