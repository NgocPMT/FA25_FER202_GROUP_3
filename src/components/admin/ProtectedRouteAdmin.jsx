import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRouteAdmin({ children }) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const validateAdmin = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/validate-admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (!data.valid) navigate("/home");
    };

    if (!token) navigate("/sign-in");

    validateAdmin();
  }, []);

  return children;
}
