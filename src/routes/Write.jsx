import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useState, useRef } from "react";
import useLogOut from "@/hooks/useLogOut";

import { IoWarning } from "react-icons/io5";
import { useNavigate } from "react-router";
import Modal from "@/components/Modal";
import { useLoader } from "@/context/LoaderContext";
import { toast } from "react-toastify";

const Write = () => {
  const [isAvatarDropdownShow, setIsAvatarDropdownShow] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalShow, setIsModalShow] = useState(false);
  const [title, setTitle] = useState("");
  const logOut = useLogOut();
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [draftId, setDraftId] = useState(null);

  const [selectedTopics, setSelectedTopics] = useState([]);

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

  const handlePublish = async (isEmpty) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setModalMessage("You must login before posting");
        openModal();
        return;
      }

      showLoader();

      const content = editorRef.current?.getContent();
      const coverImageUrl = extractFirstImageURL(content);

      if (!title || title.trim().length === 0) {
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
          topics: selectedTopics,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setModalMessage(err.error);
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

  const handleAutoSave = async (isEmpty, signal) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setModalMessage("You must login before posting");
        openModal();
        return;
      }

      const tokenRes = await fetch(
        `${import.meta.env.VITE_API_URL}/validate-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
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

      if (!title || (title.trim().length === 0 && !content) || isEmpty) {
        return;
      }

      if (title.length < 2 || title.length > 255) {
        setModalMessage("Title must be in from 2 to 255 characters");
        openModal();
        return;
      }

      toast.info("Saving...");
      console.log("draftId before save:", draftId, typeof draftId);
      const body = draftId
        ? JSON.stringify({
            id: draftId,
            title,
            content: JSON.stringify(content),
            coverImageUrl,
          })
        : JSON.stringify({
            title,
            content: JSON.stringify(content),
            coverImageUrl,
          });
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/drafts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        setModalMessage("Error: " + err.error);
        openModal();
        return;
      }

      const data = await response.json();
      if (data.createdPost) {
        setDraftId(data.createdPost.id);
      }
      toast.success(data.message);
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
        <SimpleEditor
          ref={editorRef}
          title={title}
          onTitleChange={handleTittleChange}
          handlePublish={handlePublish}
          handleAutoSave={handleAutoSave}
          isAvatarDropdownShow={isAvatarDropdownShow}
          toggleAvatarDropdownShow={toggleAvatarDropdownShow}
          logOut={logOut}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
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
