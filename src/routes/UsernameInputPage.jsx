import React from "react";
import { BsBook } from "react-icons/bs";

const UsernameInputPage = () => {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <h1 className="mt-3 mb-5 text-4xl font-bold">Easium</h1>
      <BsBook size={100} className="mt-5 mb-5" />
      <h2 className="my-3 mt-5 text-4xl font-serif">Welcome to Easium!</h2>
      <p className="my-3 mt-5 text-center text-lg">
        We need a little more information to finish creating your account.
      </p>

      {/* Input label */}
      <p className="mt-5 text-gray-500 text-sm">Your full name</p>
      <form className="w-1/3 mb-3">
        <input
          type="text"
          className="w-full border-b border-gray-300 focus:outline-none focus:border-gray-500 py-2"
        />
      </form>

      <p className="my-3 text-gray-500">Your email is <span></span> </p>

      <button
        className="mt-3 py-2 w-[150px] rounded-full bg-black text-white hover:bg-gray-800 transition cursor-pointer"
      >
        Create account
      </button>

    </div>
  );
};

export default UsernameInputPage;
