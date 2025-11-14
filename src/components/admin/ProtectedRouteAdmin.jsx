import { Navigate } from "react-router-dom";

export default function ProtectedRouteAdmin({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // stored when login

  if (!token) return <Navigate to="/sign-in" replace />;

  if (role !== "admin") return <Navigate to="/home" replace />;

  return children;
}
