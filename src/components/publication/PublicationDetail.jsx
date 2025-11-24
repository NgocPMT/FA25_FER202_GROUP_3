import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PublicationMembers from "./PublicationMembers";
import PublicationInvite from "./PublicationInvite";
import PublicationPendingPosts from "./PublicationPendingPosts";
import PublicationPosts from "./PublicationPosts";
import PublicationEdit from "./PublicationEdit";

import { BsPencil, BsTrash, BsPersonPlus, BsPencilSquare } from "react-icons/bs";

export default function PublicationDetail() {
  const { id, publicationId: pId } = useParams();
  const publicationId = pId || id;
  const [isMember, setIsMember] = useState(false);
const [showEditPopup, setShowEditPopup] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [pub, setPub] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const [posts, setPosts] = useState([]);
  const [pending, setPending] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!publicationId) return;
    loadPublication();
    checkOwner();
    checkMember();
  }, [publicationId]);

  useEffect(() => {
    if (!publicationId) return;
    if (activeTab === "posts") loadPosts();
    if (activeTab === "pending") loadPending();
  }, [activeTab, publicationId]);

  async function loadPublication() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/publications/${publicationId}`);
      const data = await res.json();
      setPub(data);
    } catch {
      toast.error("Failed to load publication");
    }
  }

  async function checkOwner() {
    if (!token) return setIsOwner(false);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/validate-owner/${publicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return setIsOwner(false);
      const data = await res.json();
      setIsOwner(data?.isOwner === true);
    } catch {
      setIsOwner(false);
    }
  }

  async function checkMember() {
    try {
      const me = JSON.parse(localStorage.getItem("user"));
      const myId = me?.id;
      if (!token || !myId) return setIsMember(false);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/publications/${publicationId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) return setIsMember(false);

      const list = await res.json();

      const found = list.some((m) => m.id === myId);
      setIsMember(found);
    } catch (err) {
      console.error(err);
      setIsMember(false);
    }
  }

  async function loadPosts() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/publications/${publicationId}/posts`);
    setPosts(await res.json());
  }

  async function loadPending() {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/publications/${publicationId}/posts/pending`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return setPending([]);
    setPending(await res.json());
  }

  const handleDeletePub = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/publications/${publicationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        toast.error("Failed to delete!");
        return;
      }
      toast.success("Publication deleted!");
      navigate("/publications");
    } catch {
      toast.error("Something went wrong!");
    }
  };

  if (!pub) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
        
      <div className="flex gap-5 mb-5">
  <img
    src={pub.avatarUrl}
    className="w-24 h-24 rounded-xl object-cover border shadow"
  />

  <div className="flex flex-col justify-between">
    <div>
      <h1 className="text-4xl font-bold">{pub.name}</h1>
      <p className="text-gray-600">{pub.bio}</p>
    </div>
  </div>

  <div className="ml-auto flex items-start gap-3">
    {isOwner ? (
      <>
       <button
  onClick={() => setShowEditPopup(true)}
  className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-200 transition"
>
  <BsPencil className="text-xl text-gray-700" />
</button>


        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-red-100 transition"
        >
          <BsTrash className="text-xl text-red-600" />
        </button>
      </>
    ) : (
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition"
      >
        <BsPersonPlus className="text-xl text-gray-700" />
      </button>
    )}
  </div>
</div>

      <div className="flex gap-8 border-b pb-3 mb-6 text-lg">
        {["posts", "members"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-2 ${activeTab === t ? "font-bold border-b-2 border-black" : "text-gray-600 cursor-pointer "}`}
          >
            {t === "posts" ? "Posts" : "Members"}
          </button>
        ))}
        {isOwner && (
          <>
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-2 ${activeTab === "pending" ? "font-bold border-b-2 border-black" : "text-gray-600 cursor-pointer "}`}
            >
              Pending Posts
            </button>
            <button
              onClick={() => setActiveTab("invite")}
              className={`pb-2 ${activeTab === "invite" ? "font-bold border-b-2 border-black" : "text-gray-600 cursor-pointer "}`}
            >
              Invitations
            </button>
          </>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        <PublicationPosts publicationId={publicationId} />
      )}

      {activeTab === "members" && (
        <PublicationMembers publicationId={publicationId} />
      )}
      {activeTab === "invite" && (
        <PublicationInvite publicationId={publicationId} />
      )}
      {activeTab === "pending" && (
        <PublicationPendingPosts publicationId={publicationId} />
      )}
      {/* {activeTab === "invite" && <PublicationInvite />} */}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-80 rounded-xl shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-3">
              Delete this publication?
            </h2>
            <p className="text-gray-600 text-sm">This action cannot be undone.</p>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDeletePub();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditPopup && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">

    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8 relative">
      
      {/* nút đóng popup */}
      <button
        onClick={() => setShowEditPopup(false)}
        className="absolute right-4 top-4 text-gray-500 hover:text-black text-2xl"
      >
        ✕
      </button>

      {/* NHÚNG COMPONENT EDIT Ở ĐÂY */}
      <PublicationEdit publicationId={publicationId} onClose={() => setShowEditPopup(false)} />
    </div>
  </div>
)}

    </div>
  );
}
