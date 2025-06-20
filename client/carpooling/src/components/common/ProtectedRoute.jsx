import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  console.log(user);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const role = localStorage.getItem("role");
  console.log(role)
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
