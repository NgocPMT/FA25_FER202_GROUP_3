import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function PublicationInvite() {
  const { id: publicationId } = useParams();
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    loadInvitations();
  }, [publicationId]);

  const searchUsers = async () => {
    if (!search.trim()) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users?search=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setResults(data);
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
    } catch {
      toast.error("Failed to send invitation.");
    }
  };

  const loadInvitations = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/publications/${publicationId}/invitations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setInvitations(data);
    } catch {
      toast.error("Failed to load invitations.");
    }
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
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Search
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {results.map((u) => (
            <div
              key={u.id}
              className="border p-2 rounded flex justify-between items-center"
            >
              <span>{u.username}</span>
              <button
                onClick={() => sendInvitation(u.id)}
                className="text-sm text-green-600 hover:underline"
              >
                Invite
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Sent Invitations</h2>
        <ul className="space-y-2">
          {invitations.length === 0 && (
            <p className="text-gray-500">No invitations sent.</p>
          )}
          {invitations.map((inv) => (
            <li key={inv.id} className="border p-2 rounded">
              <span>{inv.invitee?.username}</span> – {inv.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
