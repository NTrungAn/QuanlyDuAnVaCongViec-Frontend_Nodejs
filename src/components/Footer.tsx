import React from 'react';
import { Github, Twitter, Facebook, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-gray-800">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
              ProManager
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Giải pháp quản lý dự án và công việc tối ưu dành cho cá nhân và doanh nghiệp.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-all text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-all text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-all text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Tính năng</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/projects" className="hover:text-blue-400 transition-colors">Quản lý dự án</Link></li>
              <li><Link to="/tasks" className="hover:text-blue-400 transition-colors">Công việc hàng ngày</Link></li>
              <li><Link to="/stats" className="hover:text-blue-400 transition-colors">Thống kê & Báo cáo</Link></li>
              <li><Link to="/notifications" className="hover:text-blue-400 transition-colors">Thông báo tức thời</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tài liệu API</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Liên hệ</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <span>support@promanager.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-blue-400" />
                <span>www.promanager.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs">
          <p>© {currentYear} ProManager Inc. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Thiết kế bởi Team 123</span>
            <span>Phiên bản 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
