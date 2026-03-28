import React from "react";
import { LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Header: React.FC = () => {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-4 z-40 w-full mx-auto px-4 md:px-6 lg:px-8 mb-6 transition-all duration-300">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm h-16 w-full px-4 sm:px-6 flex justify-end items-center">
        {/* User Actions / Auth Buttons */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 group hover:bg-slate-50 p-1.5 pr-4 rounded-xl transition-all border border-transparent hover:border-slate-100"
            >
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-lg group-hover:from-blue-600 group-hover:to-indigo-600 transition-colors shadow-sm">
                <User className="h-4 w-4 text-blue-700 group-hover:text-white" />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-bold text-slate-900 leading-none">
                  {user?.fullName || "Người dùng"}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-extrabold">
                  {user?.roles?.[0] || "User"}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
