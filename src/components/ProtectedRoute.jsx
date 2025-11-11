import { useLoader } from "@/context/LoaderContext";
import useLogOut from "@/hooks/useLogOut";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null); // null = loading
  const token = localStorage.getItem("token");
  const { showLoader, hideLoader } = useLoader();
  const logOut = useLogOut();

  useEffect(() => {
    const controller = new AbortController(); // Create an AbortController
    const signal = controller.signal; // Extract the signal

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
            signal, // Attach abort signal
          }
        );

        if (!res.ok) {
          const data = await res.json();
          console.log("Token validation error:", data);
          logOut();
          return;
        }

        const data = await res.json();
        setIsValid(data.valid);

        if (data.valid === false) localStorage.removeItem("token");
      } catch (error) {
        // Ignore abort errors (user navigated away, token changed, etc.)
        if (error.name === "AbortError") {
          console.log("Token validation aborted");
        } else {
          console.error("Error validating token:", error);
          setIsValid(false);
        }
      } finally {
        hideLoader();
      }
    };

    validateToken();

    return () => {
      controller.abort();
    };
  }, [token]);

  if (!token || isValid === false) return <Navigate to="/" />;

  return <>{children}</>;
};

export default ProtectedRoute;
