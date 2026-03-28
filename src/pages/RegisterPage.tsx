import React, { useState } from "react";
import { User, Mail, Lock, Layout, Star, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/users/register", {
        email,
        password,
        fullName,
      });
      // Đăng ký thành công, chuyển hướng sang trang login
      navigate("/login");
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-emerald-100">
      {/* Left Side - Branding & Decoration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-between p-12 xl:p-24 lg:border-r border-slate-800">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '9s' }} />
          <div className="absolute bottom-[-10%] -left-1/4 w-[120%] h-[120%] bg-teal-500/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-white/10 backdrop-blur-md">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">ProjectPro</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 py-12">
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
            Bắt đầu hành trình <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              làm việc thăng hoa.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-12 max-w-lg">
            Tạo tài khoản miễn phí để tham gia cùng hàng ngàn nhóm đang sử dụng ProjectPro để tối ưu hóa năng suất mỗi ngày.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-slate-300 transform transition-transform duration-300 hover:translate-x-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                <Star className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-0.5">Nhanh chóng & Dễ dàng</h4>
                <p className="text-sm text-slate-400">Thiết lập dự án đầu tiên chỉ trong 1 phút.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-slate-300 transform transition-transform duration-300 hover:translate-x-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-0.5">Cộng tác không giới hạn</h4>
                <p className="text-sm text-slate-400">Mời thành viên và phân quyền chặt chẽ.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-sm text-slate-500 font-medium">
          <span>© 2026 ProjectPro. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#help" className="hover:text-slate-300 transition-colors">Điều khoản</a>
            <a href="#policy" className="hover:text-slate-300 transition-colors">Bảo mật</a>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-slate-50/50 relative">
        {/* Mobile Logo Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">ProjectPro</span>
        </div>

        <div className="w-full max-w-md mt-16 lg:mt-0 transition-all duration-700">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Tạo tài khoản</h2>
            <p className="text-slate-500 text-lg">
              Điền thông tin bên dưới để bắt đầu sử dụng.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-100 flex items-start gap-3 transform transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-100/50 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <div className="flex-1 mt-2.5">
                <h4 className="text-sm font-bold text-red-900 mb-0.5">Đăng ký thất bại</h4>
                <p className="text-sm text-red-600/90">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name Input */}
            <div className="group">
              <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-emerald-600">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-base focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm hover:border-slate-300"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-emerald-600">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-base focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm hover:border-slate-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-emerald-600">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-base focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm hover:border-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full group relative flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-emerald-500/30 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transform transition-all active:scale-[0.98] overflow-hidden ${
                  loading ? "opacity-80 cursor-not-allowed" : ""
                }`}
              >
                {/* Button Glow Effect */}
                <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng ký tài khoản</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-10 text-center">
            <p className="text-base text-slate-500 font-medium">
              Bạn đã có tài khoản?{" "}
              <Link to="/login" className="font-bold text-slate-900 border-b-2 border-slate-900 hover:text-emerald-600 hover:border-emerald-600 transition-colors pb-0.5 ml-1">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
