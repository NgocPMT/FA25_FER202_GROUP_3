import { useNavigate } from "react-router";
const useLogOut = () => {
  const navigate = useNavigate();

  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("searchHistory");
    navigate("/");
  };

  return logOut;
};

export default useLogOut;
