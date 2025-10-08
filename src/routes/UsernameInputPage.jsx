import React, { useState } from "react";
import { BsBook } from "react-icons/bs";

const UsernameInputPage = () => {
  const [fullName, setFullName] = useState("");

  // mail
  const email = "user@example.com";

  const handleSubmit = (e) => {
    e.preventDefault();

    // console
    const formData = {
      fullName,
      email,
    };

    console.log("Form submitted:", formData);

  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <h1 className="mt-3 mb-5 text-4xl font-bold">Easium</h1>
      <BsBook size={100} className="mt-5 mb-5" />
      <h2 className="my-3 mt-5 text-4xl font-serif">Welcome to Easium!</h2>
      <p className="my-3 mt-5 text-center text-lg">
        We need a little more information to finish creating your account.
      </p>

      <form onSubmit={handleSubmit} className="w-1/3 mb-3 flex flex-col items-center">
        <div className="w-100 mb-3 flex flex-col items-center group">
          <p
            className={`mt-5 text-sm transition duration-300 
              ${fullName.trim() !== "" ? "text-black" : "text-gray-500"} 
              group-hover:text-black peer-focus:text-black`}
          >
            Your full name
          </p>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="peer w-full border-b border-gray-300 py-2 focus:outline-none 
               transition duration-300 group-hover:border-black 
               focus:border-black"
            required
          />
        </div>

        <p className="my-3 text-gray-500 text-center">
          Your email is <span className="font-medium text-black">{email}</span>
        </p>

        <button
          type="submit"
          className="mt-3 py-2 w-[150px] rounded-full bg-black text-white 
             hover:bg-gray-800 transition duration-300 transform hover:scale-103"
        >
          Create account
        </button>

      </form>
    </div>
  );
};

export default UsernameInputPage;
