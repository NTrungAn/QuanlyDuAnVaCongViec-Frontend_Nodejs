import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectListPage from "./pages/ProjectListPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectFormPage from "./pages/ProjectFormPage";
import Layout from "./components/Layout";

// Component để bảo vệ các route cần đăng nhập
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Layout noCard>
              <LoginPage />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout noCard>
              <RegisterPage />
            </Layout>
          }
        />

        {/* Trang chủ - cần đăng nhập */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div className="flex flex-col items-center justify-center py-10">
                <div className="bg-blue-50 p-6 rounded-2xl mb-8 w-full max-w-4xl">
                  <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
                    Quản lý Dự án và Công việc
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Hệ thống đã sẵn sàng để bạn bắt đầu công việc.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                  <Link
                    to="/projects"
                    className="p-6 border border-gray-100 rounded-xl hover:shadow-md transition-shadow group bg-white"
                  >
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                      Dự án của tôi
                    </h3>
                    <p className="text-sm text-gray-500">
                      Xem và quản lý tất cả các dự án bạn đang tham gia.
                    </p>
                  </Link>
                  <div className="p-6 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Công việc hôm nay
                    </h3>
                    <p className="text-sm text-gray-500">
                      Danh sách các nhiệm vụ cần hoàn thành trong ngày.
                    </p>
                  </div>
                  <div className="p-6 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Thông báo mới
                    </h3>
                    <p className="text-sm text-gray-500">
                      Cập nhật các thay đổi mới nhất từ đồng đội.
                    </p>
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        {/* Project Routes */}
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <PrivateRoute>
              <ProjectFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <PrivateRoute>
              <ProjectDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:projectId/edit"
          element={
            <PrivateRoute>
              <ProjectFormPage />
            </PrivateRoute>
          }
        />

        {/* Mặc định chuyển về trang chủ */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
