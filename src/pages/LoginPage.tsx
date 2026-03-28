import React, { useState } from "react";
import { Mail, Lock, Layout, CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      // Backend trả về { accessToken, refreshToken, email, fullName }
      const { accessToken, ...userData } = response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Chuyển hướng sang trang chủ sau khi login thành công
      navigate("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-blue-100">
      {/* Left Side - Branding & Decoration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-between p-12 xl:p-24 lg:border-r border-slate-800">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] -right-1/4 w-[120%] h-[120%] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/10 backdrop-blur-md">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">ProjectPro</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 py-12">
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
            Quản lý công việc <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              hiệu quả, thông minh.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-12 max-w-lg">
            Nền tảng toàn diện nhất giúp team của bạn cộng tác, theo dõi tiến độ và hoàn thành mục tiêu đúng hạn, mọi lúc mọi nơi.
          </p>

          <div className="space-y-5">
            {[
              "Giao diện trực quan, linh hoạt với Kanban & Backlog",
              "Quản lý vòng đời Sprint chuẩn phương pháp Agile",
              "Theo dõi hiệu suất qua báo cáo thời gian thực"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 text-slate-300 transform transition-transform duration-300 hover:translate-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="font-medium text-base">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-sm text-slate-500 font-medium">
          <span>© 2026 ProjectPro. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#help" className="hover:text-slate-300 transition-colors">Trợ giúp</a>
            <a href="#policy" className="hover:text-slate-300 transition-colors">Bảo mật</a>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-slate-50/50 relative">
        {/* Mobile Logo Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">ProjectPro</span>
        </div>

        <div className="w-full max-w-md mt-16 lg:mt-0 transition-all duration-700">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Chào mừng trở lại</h2>
            <p className="text-slate-500 text-lg">
              Vui lòng đăng nhập để tiếp tục quản lý dự án.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-100 flex items-start gap-3 transform transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-100/50 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <div className="flex-1 mt-2.5">
                <h4 className="text-sm font-bold text-red-900 mb-0.5">Đăng nhập thất bại</h4>
                <p className="text-sm text-red-600/90">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-blue-600">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-base focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm hover:border-slate-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 transition-colors group-focus-within:text-blue-600">
                  Mật khẩu
                </label>
                <a href="#forgot" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-base focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm hover:border-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full group relative flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-500/30 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transform transition-all active:scale-[0.98] overflow-hidden ${
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
                    <span>Đăng nhập ngay</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-10 text-center">
            <p className="text-base text-slate-500 font-medium">
              Bạn chưa có tài khoản?{" "}
              <Link to="/register" className="font-bold text-slate-900 border-b-2 border-slate-900 hover:text-blue-600 hover:border-blue-600 transition-colors pb-0.5 ml-1">
                Đăng ký miễn phí
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Add Custom Animations in index.css if not present, or inject here */}
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

export default LoginPage;
