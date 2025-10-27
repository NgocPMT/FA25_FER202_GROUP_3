import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useState, useRef } from "react";
import useLogOut from "@/hooks/useLogOut";
import { RxAvatar } from "react-icons/rx";
import { Link, useNavigate } from "react-router";

const Write = () => {
  const [isAvatarDropdownShow, setIsAvatarDropdownShow] = useState(false);
  const [title, setTitle] = useState("");
  const logOut = useLogOut();
  const editorRef = useRef(null);
  const navigate = useNavigate();

  const toggleAvatarDropdownShow = () => {
    setIsAvatarDropdownShow(!isAvatarDropdownShow);
  };

  const handleTittleChange = (e) => {
    setTitle(e.target.value);
  };

  const handlePublish = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const content = editorRef.current?.getContent();
    const coverImageUrl = extractFirstImageURL(content);

    if (!title || !content) {
      alert("Title or content is missing");
      return;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content: JSON.stringify(content),
        coverImageUrl,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      alert("Error: " + err.error);
      return;
    }

    const data = await response.json();
    console.log("Post saved:", data);
    navigate("/home");
  };

  const extractFirstImageURL = (jsonContent) => {
    if (!jsonContent || !jsonContent.content) return null;

    for (const node of jsonContent.content) {
      if (node.type === "image" && node.attrs?.src) {
        return node.attrs.src;
      }
      if (node.content) {
        const nested = extractFirstImageURL(node);
        if (nested) return nested;
      }
    }

    return null;
  };

  return (
    <div>
      <nav className="flex justify-between max-w-5xl py-2 px-4 md:mx-auto mb-5">
        <Link to="/home" className="font-bold text-3xl font-lora">
          Easium
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePublish}
            className="bg-green-700 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-green-800"
          >
            Publish
          </button>
          <div className="relative w-8 h-8">
            <button
              onClick={toggleAvatarDropdownShow}
              className="w-full h-full rounded-full flex items-center justify-center text-white font-bold cursor-pointer flex-shrink-0 overflow-hidden"
            >
              <RxAvatar className="w-full h-full text-black" />
            </button>
            {isAvatarDropdownShow && (
              <div className="bg-white top-10 right-0 absolute w-fit z-50">
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

      <SimpleEditor
        ref={editorRef}
        title={title}
        onTitleChange={handleTittleChange}
      />
    </div>
  );
};

export default Write;
