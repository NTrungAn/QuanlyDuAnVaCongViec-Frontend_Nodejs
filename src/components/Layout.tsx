import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  noCard?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, noCard = false }) => {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen flex bg-slate-50 relative selection:bg-blue-100">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 blur-[100px] rounded-full mix-blend-multiply" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-indigo-400/10 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-blue-300/10 blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      {isLoggedIn && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 min-h-screen">
        {/* Floating Header */}
        {isLoggedIn && (
          <div className="relative z-40">
            <Header />
          </div>
        )}

        <main className={`relative z-10 flex-grow w-full ${noCard ? "" : "px-2 md:px-4 pb-4 pt-1"}`}>
          {noCard ? (
            children
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white min-h-[80vh] p-4 md:p-5 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          )}
        </main>

        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
