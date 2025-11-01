import { useLoader } from "@/context/LoaderContext";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

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

        const data = await res.json();

        if (data.valid) {
          setIsValid(true);
        } else {
          setIsValid(false);
          localStorage.removeItem("token");
        }
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
