import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  // Giữ lại noCard để linh hoạt, nhưng ta sẽ thêm prop fullWidth nếu sau này bạn cần
  noCard?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, noCard = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main
        // Bỏ "max-w-7xl mx-auto" để nó mở rộng tràn viền (Full-width)
        className={`flex-grow w-full ${noCard ? "" : "px-4 sm:px-6 lg:px-8 py-6"}`}
      >
        {noCard ? (
          children
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[80vh] p-4 sm:p-6 w-full">
            {children}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
