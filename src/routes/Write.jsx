import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useState, useRef, useEffect } from "react";
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

  const [selectedPublication, setSelectedPublication] = useState(null);
  const [pubModal, setPubModal] = useState(false);
  const [myPublications, setMyPublications] = useState([]);

  const logOut = useLogOut();
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [draftId, setDraftId] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);

  const toggleAvatarDropdownShow = () => {
    setIsAvatarDropdownShow(!isAvatarDropdownShow);
  };

  const openModal = () => setIsModalShow(true);
  const closeModal = () => setIsModalShow(false);

  const handleTittleChange = (e) => {
    setTitle(e.target.value);
  };

  // FETCH DANH SÁCH PUBLICATION USER 
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/me/publications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMyPublications(data || []))
      .catch(() => { });
  }, []);

  // HANDLE PUBLISH 
  const handlePublish = async (isEmpty) => {
    const token = localStorage.getItem("token");
    const content = editorRef.current?.getContent();
    const coverImageUrl = extractFirstImageURL(content);

    if (!token) {
      setModalMessage("You must login before posting");
      openModal();
      return;
    }

    if (!title || title.trim().length === 0) {
      setModalMessage("Title is missing");
      openModal();
      return;
    }

    if (title.length < 2 || title.length > 255) {
      setModalMessage("Title must be from 2 to 255 characters");
      openModal();
      return;
    }

    if (!content || isEmpty) {
      setModalMessage("Content is missing");
      openModal();
      return;
    }

    if (myPublications.length > 0) {
      setPubModal(true); // mở popup chọn publication
    } else {
      submitToPersonal(content, coverImageUrl);
    }
  };

  
  // FUNCTION: SUBMIT 
  const submitToPersonal = async (content, coverImageUrl) => {
    try {
      showLoader();
      const token = localStorage.getItem("token");

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
      toast.success("Post published successfully!");
      navigate("/home");
    } finally {
      hideLoader();
    }
  };

  
  // FUNCTION: SUBMIT PUBLICATION (PENDING)
  const submitToPublication = async (publicationId) => {
    try {
      showLoader();
      const token = localStorage.getItem("token");
      const content = editorRef.current?.getContent();
      const coverImageUrl = extractFirstImageURL(content);

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
            topics: selectedTopics,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        setModalMessage(err.error);
        openModal();
        return;
      }

      toast.success("Submitted to publication (waiting for approval)");
      navigate(`/publications/${publicationId}`);
    } finally {
      hideLoader();
    }
  };

 
  // AUTO SAVE FUNCTION
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
        setModalMessage("Title must be from 2 to 255 characters");
        openModal();
        return;
      }

      toast.info("Saving...");

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

      const data = await response.json();
      if (data.createdPost) setDraftId(data.createdPost.id);
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

  // UI
 
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

      {/* MODAL HIỂN THỊ LỖI */}
      <Modal open={isModalShow} onClose={closeModal}>
        <div className="p-8 min-h-24 flex flex-col items-center">
          <IoWarning className="text-red-800 size-12 mb-4" />
          <h5 className="text-red-800 text-center text-xl mb-4 font-semibold">
            Post Publishing Failed
          </h5>
          <p className="text-gray-600 text-sm">{modalMessage}</p>
        </div>
      </Modal>

      {/* MODAL CHỌN PUBLICATION */}
      {pubModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded-xl shadow-xl">

            <h2 className="text-xl font-semibold mb-4 text-center">
              Submit to a Publication
            </h2>

            {/* LIST WITH SCROLL*/}
            <div
              className="
          max-h-64
          overflow-y-auto
          pr-2
          space-y-2
        "
            >
              {myPublications.length === 0 ? (
                <p className="text-gray-600 text-center">
                  You are not a member of any publication.
                </p>
              ) : (
                myPublications.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPubModal(false);
                      submitToPublication(p.id);
                    }}
                    className="
                w-full p-3 border rounded-lg flex items-center gap-3
                hover:bg-gray-100 transition-all
                cursor-pointer        /* ⭐ THÊM TẠI ĐÂY */
              "
                  >
                    <img
                      src={
                        p.avatarUrl ||
                        'https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp'
                      }
                      className="w-8 h-8 rounded-md object-cover border"
                    />
                    <span className="font-medium">{p.name}</span>
                  </button>
                ))
              )}
            </div>


            <button
              onClick={() => {
                setPubModal(false);
                submitToPersonal(
                  editorRef.current?.getContent(),
                  extractFirstImageURL(editorRef.current?.getContent())
                );
              }}
              className="
          w-full p-3 mt-4 bg-black text-white rounded-lg 
          cursor-pointer         
        "
            >
              Publish as Personal Post
            </button>

            <button
              onClick={() => setPubModal(false)}
              className="
          w-full mt-3 text-gray-500 hover:underline
          cursor-pointer        
        "
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </>
  );
};

export default Write;
