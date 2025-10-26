import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useState } from "react";
import useLogOut from "@/hooks/useLogOut";
import { RxAvatar } from "react-icons/rx";
import { Link } from "react-router";

const Write = () => {
  const [isAvatarDropdownShow, setIsAvatarDropdownShow] = useState(false);
  const [title, setTitle] = useState("");
  const logOut = useLogOut();

  const toggleAvatarDropdownShow = () => {
    setIsAvatarDropdownShow(!isAvatarDropdownShow);
  };

  const handleTittleChange = (e) => {
    setTitle(e.target.value);
  };

  return (
    <div>
      <nav className="flex justify-between max-w-5xl py-2 px-4 md:mx-auto mb-5">
        <Link to="/home" className="font-bold text-3xl font-lora">
          Easium
        </Link>
        <div className="flex items-center gap-4">
          <button className="bg-green-700 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-green-800">
            Publish
          </button>
          <div className="relative w-8 h-8 ">
            <button
              onClick={toggleAvatarDropdownShow}
              className="w-full h-full rounded-full flex items-center justify-center text-white font-bold cursor-pointer flex-shrink-0 overflow-hidden"
            >
              <RxAvatar className="w-full h-full text-black" />
            </button>
            {isAvatarDropdownShow && (
              <div className="bg-white top-10 right-0 absolute w-fit">
                <button
                  onClick={logOut}
                  className="cursor-pointer hover:bg-gray-400 p-1 whitespace-nowrap"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <SimpleEditor title={title} onTitleChange={handleTittleChange} />
    </div>
  );
};

export default Write;
