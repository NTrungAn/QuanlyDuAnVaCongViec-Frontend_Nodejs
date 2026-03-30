import React from 'react';
import { Github, Twitter, Facebook, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/60 bg-white/40 backdrop-blur-md w-full">
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-slate-200/60">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 tracking-tight">
              ProjectPro
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
              Giải pháp quản lý dự án và công việc tối ưu dành cho cá nhân và doanh nghiệp.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-600 shadow-sm hover:shadow">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-400 shadow-sm hover:shadow">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-800 shadow-sm hover:shadow">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Tính năng</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link to="/projects" className="hover:text-blue-600 transition-colors">Quản lý dự án</Link></li>
              <li><Link to="/tasks" className="hover:text-blue-600 transition-colors">Công việc hàng ngày</Link></li>
              <li><Link to="/stats" className="hover:text-blue-600 transition-colors">Thống kê & Báo cáo</Link></li>
              <li><Link to="/notifications" className="hover:text-blue-600 transition-colors">Thông báo tức thời</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Tài liệu API</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Liên hệ</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="h-4 w-4" />
                </div>
                <span>support@projectpro.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Globe className="h-4 w-4" />
                </div>
                <span>www.projectpro.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
          <p>© {currentYear} ProjectPro Inc. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Thiết kế bởi Team 123</span>
            <span>Phiên bản 2.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
