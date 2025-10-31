import { useNavigate } from "react-router";
const useLogOut = () => {
  const navigate = useNavigate();

  const logOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return logOut;
};

export default useLogOut;
