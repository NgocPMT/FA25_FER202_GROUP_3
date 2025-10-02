import Modal from "../components/Modal";
import SignInForm from "../components/SignInForm";
import { useNavigate } from "react-router";

const SignIn = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/", { viewTransition: true });
  };

  return (
    <Modal onClose={handleClose}>
      <SignInForm />
    </Modal>
  );
};

export default SignIn;
