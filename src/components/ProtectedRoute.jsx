import { useLoader } from "@/context/LoaderContext";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null); // null = loading
  const token = localStorage.getItem("token");
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValid(false);
        return;
      }

      try {
        showLoader();
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/validate-token`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          const data = await res.json();
          console.log(data);
          return;
        }

        const data = await res.json();
        setIsValid(data.valid);
        if (data.valid === false) localStorage.removeItem("token");
      } catch (error) {
        console.error("Error validating token:", error);
        setIsValid(false);
      } finally {
        hideLoader();
      }
    };

    validateToken();
  }, [token]);

  if (!token || isValid === false) return <Navigate to="/" />;

  return <>{children}</>;
};

export default ProtectedRoute;
