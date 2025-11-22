import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "@/components/Modal";
import { IoWarning } from "react-icons/io5";
import { useLoader } from "@/context/LoaderContext";

export default function WritePublication() {
  const { publicationId } = useParams();
  const editorRef = useRef(null);

  const [title, setTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalShow, setIsModalShow] = useState(false);

  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  /* -------------------- MODAL -------------------- */
  const openModal = (msg) => {
    setModalMessage(msg);
    setIsModalShow(true);
  };

  const closeModal = () => setIsModalShow(false);

  /* -------------------- EXTRACT COVER IMAGE -------------------- */
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

  /* -------------------- VALIDATION -------------------- */
  const validateForm = (content, isEmpty) => {
    if (!title.trim()) {
      openModal("Title is missing");
      return false;
    }
    if (title.length < 2 || title.length > 255) {
      openModal("Title must be between 2 and 255 characters");
      return false;
    }
    if (!content || isEmpty) {
      openModal("Content cannot be empty");
      return false;
    }
    return true;
  };

  /* -------------------- PUBLISH TO PUBLICATION -------------------- */
  const handlePublish = async (isEmpty) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return openModal("You must login before posting");

      showLoader();

      const content = editorRef.current?.getContent();
      const coverImageUrl = extractFirstImageURL(content);

      if (!validateForm(content, isEmpty)) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/publications/${publicationId}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            content: JSON.stringify(content),
            coverImageUrl,
            topics: [], // nếu muốn thêm topic thì chỉnh sau
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        openModal(data.error || "Failed submitting post");
        return;
      }

      toast.success("Submitted for approval!");
      navigate(`/publications/${publicationId}/pending`);
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <SimpleEditor
        ref={editorRef}
        title={title}
        onTitleChange={(e) => setTitle(e.target.value)}
        handlePublish={handlePublish}
        // Không cần autosave / avatar dropdown trong publication
        handleAutoSave={() => {}}
        isAvatarDropdownShow={false}
        toggleAvatarDropdownShow={() => {}}
      />

      {/* MODAL ---------------------------- */}
      <Modal open={isModalShow} onClose={closeModal}>
        <div className="p-8 min-h-24 flex flex-col items-center">
          <IoWarning className="text-red-800 size-12 mb-4" />
          <h5 className="text-red-800 text-center text-xl mb-4 font-semibold">
            Publishing Failed
          </h5>
          <p className="text-gray-600 text-sm">{modalMessage}</p>
        </div>
      </Modal>
    </>
  );
}
