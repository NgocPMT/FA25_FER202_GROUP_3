import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PublicationMembers from "./PublicationMembers";
import PublicationInvite from "./PublicationInvite";
import PublicationPendingPosts from "./PublicationPendingPosts";
import PublicationPosts from "./PublicationPosts";

export default function PublicationDetail() {
  const { id, publicationId: pId } = useParams();
  const publicationId = pId || id;
  const [isMember, setIsMember] = useState(false);

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

    const list = await res.json();  // ← Không text + không parse thủ công

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
      <div className="flex items-center gap-5 mb-10">
        <img
          src={pub.avatarUrl}
          className="w-24 h-24 rounded-xl object-cover border shadow"
        />
                     {(isOwner || isMember) && (
            <button
              onClick={() => navigate(`/publications/${publicationId}/write`)}
              className="px-4 py-2 bg-black text-white rounded-full"
            >
              Write Post
            </button>
          )}
        <div>
          <h1 className="text-4xl font-bold">{pub.name}</h1>
          <p className="text-gray-600 mt-1">{pub.bio}</p>
        </div>
        <div className="ml-auto">
          {isOwner ? (
            <div className="flex gap-3">
              <Link
                to={`/publications/${publicationId}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-full"
              >
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-full"
              >
                Delete
              </button>
            </div>
          ) : (
            <button className="px-5 py-2 bg-black text-white rounded-full">
              Follow
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b pb-3 mb-6 text-lg">
        {["posts", "members"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-2 ${activeTab === t ? "font-bold border-b-2 border-black" : "text-gray-600"}`}
          >
            {t === "posts" ? "Posts" : "Members"}
          </button>
        ))}
        {isOwner && (
          <>
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-2 ${activeTab === "pending" ? "font-bold border-b-2 border-black" : "text-gray-600"}`}
            >
              Pending Posts
            </button>
            <button
              onClick={() => setActiveTab("invite")}
              className={`pb-2 ${activeTab === "invite" ? "font-bold border-b-2 border-black" : "text-gray-600"}`}
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
    </div>
  );
}
