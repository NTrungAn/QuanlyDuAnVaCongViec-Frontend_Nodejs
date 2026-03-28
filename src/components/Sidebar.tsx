import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  ShieldCheck, 
  Layout,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

interface SidebarProps {
  onToggle?: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user?.roles?.includes("ADMIN");

  useEffect(() => {
    // Tự động đóng sidebar trên màn hình nhỏ
    const checkScreenSize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
        if (onToggle) onToggle(true);
      } else {
        setCollapsed(false);
        if (onToggle) onToggle(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [onToggle]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle(!collapsed);
  };

  const navItems = [
    {
      name: "Bảng điều khiển",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true
    },
    {
      name: "Dự án",
      path: "/projects",
      icon: <Briefcase className="h-5 w-5" />,
      exact: false
    }
  ];

  if (isAdmin) {
    navItems.push({
      name: "Quản trị",
      path: "/admin",
      icon: <ShieldCheck className="h-5 w-5" />,
      exact: false
    });
  }

  return (
    <aside 
      className={`h-screen sticky top-0 flex flex-col bg-white/70 backdrop-blur-xl border-r border-slate-200/60 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 z-50 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Container header/logo */}
      <div className={`h-24 flex items-center ${collapsed ? "justify-center" : "px-6 justify-between"} border-b border-transparent`}>
        {/* Logo */}
        <Link 
          to="/" 
          className={`flex items-center gap-3 group transition-all duration-300 overflow-hidden ${collapsed ? "w-12 justify-center" : "w-auto"}`}
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-md border border-white/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Layout className="h-5 w-5 text-white" />
          </div>
          
          <span className={`text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-tight whitespace-nowrap transition-all duration-300 ${collapsed ? "opacity-0 w-0 -translate-x-4" : "opacity-100"}`}>
            ProjectPro
          </span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className={`flex-1 py-8 flex flex-col gap-2 ${collapsed ? "px-3" : "px-4"}`}>
        {navItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
            
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center group rounded-2xl transition-all duration-200 ${collapsed ? "justify-center w-12 h-12 py-0 mx-auto" : "px-4 py-3 gap-3 w-full"} ${
                isActive 
                  ? "bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100/50" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent"
              }`}
              title={collapsed ? item.name : ""}
            >
              <div className={`${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"} transition-colors flex-shrink-0`}>
                {item.icon}
              </div>
              
              <span className={`whitespace-nowrap transition-all duration-300 ${collapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
                {item.name}
              </span>

              {/* Active Indicator (Only show when collapsed & active) */}
              {collapsed && isActive && (
                <div className="absolute left-1 w-1 h-6 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Toggle Button */}
      <div className={`p-4 border-t border-slate-100 flex ${collapsed ? "justify-center" : "justify-end"}`}>
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/60 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
