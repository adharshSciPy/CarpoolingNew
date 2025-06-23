import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return token && role === "admin" ? <Outlet /> : <Navigate to="/admin" />;
};

export default AdminProtectedRoute;
