import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  noCard?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, noCard = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main
        className={`flex-grow w-full ${noCard ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"}`}
      >
        {noCard ? (
          children
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[60vh] p-6 sm:p-10">
            {children}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
