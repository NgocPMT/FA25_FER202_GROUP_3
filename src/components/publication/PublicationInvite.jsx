import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";


export default function PublicationInvite() {
  const { publicationId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    loadInvitations();
  }, [publicationId]);

  const searchUsers = async () => {
    if (!search.trim()) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users?search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("Invitations data:", data);
      const pendingInviteeIds = invitations
        .filter((inv) => inv.status === "PENDING")
        .map((inv) => inv.inviteeId);

      const results = data.filter((u) => {
        const match =
          u.username.toLowerCase().includes(search.trim().toLowerCase()) ||
          u.name?.toLowerCase().includes(search.trim().toLowerCase());
        return match && !pendingInviteeIds.includes(u.id);
      });

      setFilteredResults(results);
      setAllUsers(data);
    } catch {
      toast.error("Search failed.");
    }
  };

  const sendInvitation = async (inviteeId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ publicationId: Number(publicationId), inviteeId }),
      });

      if (!res.ok) throw new Error();
      toast.success("Invitation sent!");
      loadInvitations();
      setFilteredResults((prev) => prev.filter((u) => u.id !== inviteeId));
    } catch (e) {
      toast.error("Failed to send invitation.");
      console.error(e);
    }
  };

  const loadInvitations = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/publications/${publicationId}/invitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("Loaded invitations:", data);
      setInvitations(data);
    } catch {
      toast.error("Failed to load invitations.");
    }
  };

  const statusStyle = {
    PENDING: "text-yellow-600",
    ACCEPTED: "text-green-600",
    DECLINED: "text-red-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Invite User</h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username"
            className="border rounded px-3 py-2 flex-1"
          />
          <button
            onClick={searchUsers}
            className="w-12 h-12 flex items-center justify-center rounded-xl 
             border border-gray-300 bg-white hover:bg-gray-100 
             transition cursor-pointer"
          >
            <FiSearch size={20} className="text-gray-700" />
          </button>

        </div>

        <div className="mt-3 space-y-2">
          {filteredResults.map((u) => (
            <div
              key={u.id}
              className="border p-2 rounded flex justify-between items-center"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${u.username}`)}
              >
                <img
                  src={
                    u.avatarUrl ||
                    "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                  }
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <span className="font-medium hover:underline">
                  {u.username}
                </span>
              </div>
              <button
                onClick={() => sendInvitation(u.id)}
                className="text-sm text-green-600 hover:underline"
              >
                Invite
              </button>
            </div>
          ))}
          {filteredResults.length === 0 && search && (
            <p className="text-gray-500 text-sm mt-2">No users found.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Sent Invitations</h2>
        <ul className="space-y-2">
          {invitations.length === 0 && (
            <p className="text-gray-500">No invitations sent.</p>
          )}
          {invitations.map((inv) => (
            <li
              key={inv.id}
              className="border p-2 rounded flex justify-between items-center"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${inv.invitee?.username}`)}
              >
                <img
                  src={
                    inv.invitee?.avatarUrl ||
                    "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                  }
                  alt={inv.invitee?.username}
                  className="w-9 h-9 rounded-full object-cover border"
                />
                <span className="hover:underline">
                  {inv.invitee?.username || "(no username)"}
                </span>
              </div>
              <span className={`text-sm font-medium ${statusStyle[inv.status] || ""}`}>
                {inv.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
