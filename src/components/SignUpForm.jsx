import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdAccountCircle } from "react-icons/md";
import { Link, useNavigate } from "react-router";
import FormField from "./FormField";

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [isAccount, setIsAccount] = useState(false);
  const navigate = useNavigate();

  const handleUsernameInput = (e) => {
    setUsername(e.target.value);
  };

  const handleEmailInput = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordInput = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordConfirmationInput = (e) => {
    setPasswordConfirmation(e.target.value);
  };

  const handleFormValidation = () => {
    let usernameErr = null;
    let emailErr = null;
    let passwordErr = null;
    let passwordConfirmationErr = null;

    const usernameLength = username.trim().length;
    if (usernameLength === 0) {
      usernameErr = "Username must not be empty";
    } else if (usernameLength < 3 || usernameLength > 255) {
      usernameErr = "Username must be between 3 and 255 characters";
    }

    if (email.trim().length === 0) {
      emailErr = "Email must not be empty";
    } else if (!email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)) {
      emailErr = "Please enter a valid email";
    }

    const passwordLength = password.trim().length;
    if (passwordLength === 0) {
      passwordErr = "Password must not be empty";
    } else if (passwordLength < 6 || passwordLength > 255) {
      passwordErr = "Password must be between 6 and 255 characters";
    }

    if (password !== passwordConfirmation) {
      passwordConfirmationErr =
        "Password must match with password confirmation";
    }

    setValidationErrors([
      usernameErr,
      emailErr,
      passwordErr,
      passwordConfirmationErr,
    ]);
  };

  const handleSubmitAccountForm = async () => {
    handleFormValidation();
    const isValid = validationErrors.filter((error) => !!error).length === 0;
    if (!isValid) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        passwordConfirmation,
      }),
    });
    const data = await res.json();
    if (data.errors) {
      console.log(data.errors);
    } else {
      navigate("/sign-in");
    }
  };

  return (
    <div className="max-sm:min-w-lvw max-md:min-h-lvh md:p-12 sm:w-[40rem] flex flex-col justify-center items-center gap-6 md:gap-8">
      {isAccount ? (
        <>
          <h2 className="font-lora text-2xl">Sign up with account</h2>
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
              id="email"
              label="Email"
              value={email}
              placeholder="Enter your email"
              type="email"
              onChange={handleEmailInput}
              onBlur={handleFormValidation}
              error={validationErrors[1]}
            />
            <FormField
              id="password"
              label="Password"
              value={password}
              placeholder="Enter your password"
              type="password"
              onChange={handlePasswordInput}
              onBlur={handleFormValidation}
              error={validationErrors[2]}
            />
            <FormField
              id="passwordConfirmation"
              label="Confirm Password"
              value={passwordConfirmation}
              placeholder="Confirm your password"
              type="password"
              onChange={handlePasswordConfirmationInput}
              onBlur={handleFormValidation}
              error={validationErrors[3]}
            />
            <div className="text-center mt-6">
              <button
                onClick={handleSubmitAccountForm}
                type="button"
                className="btn transition-opacity hover:opacity-80"
              >
                Create account
              </button>
            </div>
          </form>
          <button
            onClick={() => setIsAccount(false)}
            className="underline text-sm cursor-pointer"
          >
            Back to sign up options
          </button>
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/sign-in" className="underline">
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <h2 className="font-lora text-3xl">Join Esium.</h2>
          <div className="flex flex-col gap-4 ">
            <button className="btn bg-white text-black border px-8 md:px-16 md:py-2.5 relative">
              <FcGoogle className="h-1/2 w-auto absolute left-2 top-1/4" />
              <p>Sign up with Google</p>
            </button>
            <button
              onClick={() => setIsAccount(true)}
              className="btn bg-white text-black border px-8 md:px-16 md:py-2.5 relative"
            >
              <MdAccountCircle className="h-1/2 w-auto absolute left-2 top-1/4 text-black" />
              <p>Sign up with account</p>
            </button>
          </div>
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/sign-in" className="underline" viewTransition>
              Sign in
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

export default SignUpForm;
