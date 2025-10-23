import { useState } from "react";
import FormField from "./FormField";
import { Link } from "react-router";
import { FcGoogle } from "react-icons/fc";
import { MdAccountCircle } from "react-icons/md";
import { useNavigate } from "react-router";

const SignInForm = () => {
  const [isAccount, setIsAccount] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const navigate = useNavigate();

  const handleUsernameInput = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordInput = (e) => {
    setPassword(e.target.value);
  };

  const handleFormValidation = () => {
    let usernameErr = null;
    let passwordErr = null;

    const usernameLength = username.trim().length;
    if (usernameLength === 0) {
      usernameErr = "Username must not be empty";
    } else if (usernameLength < 3 || usernameLength > 255) {
      usernameErr = "Username must be between 3 and 255 characters";
    }

    const passwordLength = password.trim().length;
    if (passwordLength === 0) {
      passwordErr = "Password must not be empty";
    } else if (passwordLength < 6 || passwordLength > 255) {
      passwordErr = "Password must be between 6 and 255 characters";
    }

    setValidationErrors([usernameErr, passwordErr]);
  };

  const handleSubmitAccountForm = async () => {
    handleFormValidation();
    const isValid = validationErrors.filter((error) => !!error).length === 0;
    if (!isValid) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const data = await res.json();
    if (data.errors) {
      console.log(data.errors);
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      navigate("/home");
    }
  };

  return (
    <div className="max-sm:min-w-lvw max-md:min-h-lvh md:p-12 sm:w-[40rem] flex flex-col justify-center items-center gap-6 md:gap-8">
      {isAccount ? (
        <>
          <h2 className="font-lora text-2xl">Sign in with account</h2>
          <form className="w-2/3">
            <FormField
              id="username"
              label="Username"
              value={username}
              placeholder="Enter your username"
              type="text"
              onChange={handleUsernameInput}
              onBlur={handleFormValidation}
              error={validationErrors[0]}
            />
            <FormField
              id="password"
              label="Password"
              value={password}
              placeholder="Enter your password"
              type="password"
              onChange={handlePasswordInput}
              onBlur={handleFormValidation}
              error={validationErrors[1]}
            />
            <div className="text-center mt-6">
              <button
                onClick={handleSubmitAccountForm}
                type="button"
                className="btn transition-opacity hover:opacity-80"
              >
                Sign in
              </button>
            </div>
          </form>
          <button
            onClick={() => setIsAccount(false)}
            className="underline text-sm cursor-pointer"
          >
            Back to sign in options
          </button>
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/sign-up" className="underline">
              Sign Up
            </Link>
          </p>
        </>
      ) : (
        <>
          <h2 className="font-lora text-3xl">Welcome back.</h2>
          <div className="flex flex-col gap-4 ">
            <button className="btn bg-white text-black border px-8 md:px-16 md:py-2.5 relative">
              <FcGoogle className="h-1/2 w-auto absolute left-2 top-1/4" />
              <p>Sign in with Google</p>
            </button>
            <button
              onClick={() => setIsAccount(true)}
              className="btn bg-white text-black border px-8 md:px-16 md:py-2.5 relative"
            >
              <MdAccountCircle className="h-1/2 w-auto absolute left-2 top-1/4 text-black" />
              <p>Sign in with account</p>
            </button>
          </div>
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/sign-up" className="underline">
              Sign up
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500 -mt-2 max-md:max-w-2/3">
            Click “Sign up” to agree to Medium’s{" "}
            <Link to="" className="underline">
              Terms of Service
            </Link>{" "}
            and acknowledge that Medium’s{" "}
            <Link to="" className="underline">
              Privacy Policy
            </Link>{" "}
            applies to you.
          </p>
        </>
      )}
    </div>
  );
};

export default SignInForm;
