import { useNavigate } from "react-router";
const useLogOut = () => {
  const navigate = useNavigate();

  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return logOut;
};

export default useLogOut;
