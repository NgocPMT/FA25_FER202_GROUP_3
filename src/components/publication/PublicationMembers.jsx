import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PublicationMembers() {
  const { publicationId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState(null);

  useEffect(() => {
    fetchMembers();
    checkOwner();
  }, [publicationId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/publications/${publicationId}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("Fetched members:", data);
      setMembers(data);
    } catch {
      toast.error("Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  const checkOwner = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/validate-owner/${publicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setIsOwner(data?.isOwner);
    } catch {
      setIsOwner(false);
    }
  };

  const confirmRemove = async () => {
    if (!memberToRemove) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/publications/${publicationId}/members/${memberToRemove.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error();
      setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
      toast.success("Member removed.");
    } catch {
      toast.error("Failed to remove member.");
    } finally {
      setMemberToRemove(null);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Members</h2>

      {members.length === 0 && (
        <p className="text-gray-500">No members found.</p>
      )}

      {members.map((m) => {
        const joinTime = m.publicationToUsers?.[0]?.joinedAt
          ? new Date(m.publicationToUsers[0].joinedAt).toLocaleString()
          : null;

        return (
          <div
            key={m.id}
            className="border p-4 rounded-xl flex items-center justify-between hover:shadow transition"
          >
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate(`/profile/${m.username}`)}
            >
              <img
                src={
                  m.avatarUrl ||
                  "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                }
                alt={m.username}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <p className="font-medium hover:underline">{m.username}</p>
                <p className="text-sm text-gray-500">{m.email}</p>
                {joinTime && (
                  <p className="text-xs text-gray-400">Joined: {joinTime}</p>
                )}
              </div>
            </div>

            {isOwner && !m.publicationToUsers?.[0]?.isOwner && (
              <button
                onClick={() => setMemberToRemove(m)}
                className="text-red-600 hover:underline text-sm"
              >
                Remove
              </button>
            )}
          </div>
        );
      })}

      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center space-y-4">
            <h3 className="text-lg font-semibold">Remove Member</h3>
            <p className="text-gray-600">
              Are you sure you want to remove{" "}
              <span className="font-medium text-red-500">
                {memberToRemove.username}
              </span>{" "}
              from this publication?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
