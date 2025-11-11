import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useState, useRef, useEffect } from "react";
import useLogOut from "@/hooks/useLogOut";

import { IoWarning } from "react-icons/io5";
import { useNavigate, useParams } from "react-router";
import Modal from "@/components/Modal";
import { useLoader } from "@/context/LoaderContext";
import { toast } from "react-toastify";

const Edit = () => {
  const [isAvatarDropdownShow, setIsAvatarDropdownShow] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalShow, setIsModalShow] = useState(false);
  const [title, setTitle] = useState("");
  const [post, setPost] = useState(null);
  const logOut = useLogOut();
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  const { slug } = useParams();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPost = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/posts/${slug}`,
          {
            signal,
          }
        );
        const data = await res.json();

        if (data.user.username !== localStorage.getItem("username")) {
          navigate("/home");
        }

        setPost(data);
        setTitle(data.title);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      }
    };

    fetchPost();

    return () => controller.abort();
  }, [slug]);

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

  const handleSave = async (isEmpty) => {
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

      if (!content || isEmpty) {
        setModalMessage("Content is missing");
        openModal();
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            content: JSON.stringify(content),
            coverImageUrl,
            status: "published",
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        setModalMessage("Error: " + err.error);
        openModal();
        return;
      }

      const data = await response.json();
      toast.success(data.message);
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
      {post && (
        <div>
          <SimpleEditor
            ref={editorRef}
            title={title}
            onTitleChange={handleTittleChange}
            handlePublish={handleSave}
            isAvatarDropdownShow={isAvatarDropdownShow}
            toggleAvatarDropdownShow={toggleAvatarDropdownShow}
            logOut={logOut}
            content={post.content}
          />
        </div>
      )}
      <Modal open={isModalShow} onClose={closeModal}>
        <div className="p-8 min-h-24 flex flex-col items-center">
          <IoWarning className="text-red-800 size-12 mb-4" />
          <h5 className="text-red-800 text-center text-xl mb-4 font-semibold">
            Post Updating Failed
          </h5>
          <p role="modal-message" className="text-gray-600 text-sm">
            {modalMessage}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default Edit;
