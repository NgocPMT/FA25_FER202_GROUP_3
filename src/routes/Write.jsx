import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useState, useRef } from "react";
import useLogOut from "@/hooks/useLogOut";
import { RxAvatar } from "react-icons/rx";
import { IoWarning } from "react-icons/io5";
import { Link, useNavigate } from "react-router";
import Modal from "@/components/Modal";
import { useLoader } from "@/context/LoaderContext";

const Write = () => {
  const [isAvatarDropdownShow, setIsAvatarDropdownShow] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalShow, setIsModalShow] = useState(false);
  const [title, setTitle] = useState("");
  const logOut = useLogOut();
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  const toggleAvatarDropdownShow = () => {
    setIsAvatarDropdownShow(!isAvatarDropdownShow);
  };

  const openModal = () => {
    setIsModalShow(true);
  };

  const closeModal = () => {
    setIsModalShow(false);
  };

  const handleTittleChange = (e) => {
    setTitle(e.target.value);
  };

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setModalMessage("You must login before posting");
        openModal();
        return;
      }

      showLoader();
      const tokenRes = await fetch(
        `${import.meta.env.VITE_API_URL}/validate-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tokenValidation = await tokenRes.json();

      if (!tokenValidation.valid) {
        setModalMessage("You must login before posting");
        openModal();
        return;
      }

      const content = editorRef.current?.getContent();
      const coverImageUrl = extractFirstImageURL(content);

      if (!title) {
        setModalMessage("Title is missing");
        openModal();
        return;
      }

      if (title.length < 2 || title.length > 255) {
        setModalMessage("Title must be in from 2 to 255 characters");
        openModal();
        return;
      }

      if (!content) {
        setModalMessage("Content is missing");
        openModal();
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
        setModalMessage("Error: " + err.error);
        openModal();
        return;
      }

      const data = await response.json();
      console.log("Post saved:", data);
      navigate("/home");
    } finally {
      hideLoader();
    }
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
    <>
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
      <Modal open={isModalShow} onClose={closeModal}>
        <div className="p-8 min-h-24 flex flex-col items-center">
          <IoWarning className="text-red-800 size-12 mb-4" />
          <h5 className="text-red-800 text-center text-xl mb-4 font-semibold">
            Post Publishing Failed
          </h5>
          <p role="modal-message" className="text-gray-600 text-sm">
            {modalMessage}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default Write;
