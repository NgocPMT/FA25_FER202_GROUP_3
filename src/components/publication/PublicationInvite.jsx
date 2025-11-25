import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";

export default function PublicationInvite() {
  const { publicationId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showSent, setShowSent] = useState(true);

  useEffect(() => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.id);
    } catch { }
  }, [token]);

  useEffect(() => {
    loadInvitations();
    loadMembers();
  }, [publicationId]);

  const loadInvitations = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/publications/${publicationId}/invitations`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setInvitations(await res.json());
  };

  const loadMembers = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/publications/${publicationId}/members`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMembers(await res.json());
  };

  const searchUsers = async () => {
    if (!search.trim()) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users?search=${encodeURIComponent(
          search
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const users = await res.json();

      const memberIds = members.map((m) => m.id);
      const pendingIds = invitations
        .filter((inv) => inv.status === "PENDING")
        .map((inv) => inv.inviteeId);

      const processed = users.map((u) => {
        if (u.id === currentUserId) return { ...u, status: "YOU" };
        if (memberIds.includes(u.id)) return { ...u, status: "MEMBER" };
        if (pendingIds.includes(u.id)) return { ...u, status: "PENDING" };
        return { ...u, status: "INVITE" };
      });

      setSearchResults(processed);
    } catch {
      toast.error("Search failed");
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

      setSearchResults((prev) =>
        prev.map((u) =>
          u.id === inviteeId ? { ...u, status: "PENDING" } : u
        )
      );
    } catch {
      toast.error("Failed to send invitation.");
    }
  };

  const renderStatus = (u) => {
    switch (u.status) {
      case "YOU":
        return <span className="text-gray-400 text-xs">—</span>;
      case "MEMBER":
        return <span className="text-blue-600 text-lg">✔</span>;
      case "PENDING":
        return <span className="text-yellow-600 text-lg">⏳</span>;
      case "INVITE":
        return (
          <button
            onClick={() => sendInvitation(u.id)}
            className="text-green-600 hover:underline text-sm"
          >
            Invite
          </button>
        );
      default:
        return null;
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
            placeholder="Search username"
            className="border rounded px-3 py-2 flex-1"
          />
          <button
            onClick={searchUsers}
            className="w-12 h-12 flex items-center justify-center rounded-xl 
                       border bg-white hover:bg-gray-100"
          >
            <FiSearch size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {searchResults.map((u) => (
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
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <span className="font-medium hover:underline">
                  {u.username}
                </span>
              </div>

              {renderStatus(u)}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Sent Invitations</h2>

        <button
          onClick={() => setShowSent(!showSent)}
          className="text-sm text-blue-600 hover:underline mb-2"
        >
          {showSent ? "Hide Sent Invitations" : "Show Sent Invitations"}
        </button>

        {showSent && (
          <>
            {invitations.length === 0 ? (
              <p className="text-gray-500">No invitations sent.</p>
            ) : (
              <ul className="space-y-2">
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
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                      <span className="hover:underline">
                        {inv.invitee?.username}
                      </span>
                    </div>

                    <span
                      className={`text-sm font-medium ${statusStyle[inv.status]
                        }`}
                    >
                      {inv.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

    </div>
  );
}
