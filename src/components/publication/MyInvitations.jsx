import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function MyInvitations() {
  const token = localStorage.getItem("token");
  const [invitations, setInvitations] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeclineId, setConfirmDeclineId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyInvitations();
  }, []);

  const loadMyInvitations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/me/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const safeData = Array.isArray(data) ? data : [];

      const normalized = safeData.map((inv) => ({
        ...inv,
        publication: inv.publication ?? {
          name: inv.publication_name || "Unknown publication",
          avatarUrl: inv.publication_avatar || "/default-avatar.png",
          id: inv.publication_id || inv.publicationId,
        },
        inviter: inv.inviter ?? {
          username: inv.inviter_username || "Unknown",
        },
      }));

      // ⭐ SORT theo status: PENDING → ACCEPTED → DECLINED
      const sorted = normalized.sort((a, b) => {
        const weight = { PENDING: 0, ACCEPTED: 1, DECLINED: 2 };
        return weight[a.status] - weight[b.status];
      });

      setInvitations(sorted);
    } catch (err) {
      toast.error("Failed to load invitations.");
      console.error(err);
    }
  };


  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/invitations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Invitation deleted.");
      loadMyInvitations();
    } catch {
      toast.error("Failed to delete invitation.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const respond = async (id, action) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/invitations/${id}/${action === "decline" ? "declined" : action}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error();
      toast.success(`Invitation ${action}ed.`);
      loadMyInvitations();
    } catch {
      toast.error("Failed to respond to invitation.");
    } finally {
      setConfirmDeclineId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 relative">
      <h2 className="text-3xl font-bold text-center">My Invitations</h2>
      {invitations.length === 0 && (
        <p className="text-center text-gray-500">You don’t have any invitations yet.</p>
      )}

      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="border rounded-lg p-4 flex items-center justify-between bg-white shadow hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <img
              src={inv.publication.avatarUrl}
              alt="Publication Avatar"
              className="w-14 h-14 rounded-full object-cover border"
            />
            <div>
              <p
                className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate(`/publications/${inv.publication.id}`)}
              >
                {inv.publication.name}
              </p>
              <p className="text-sm text-gray-500">Invited by: {inv.inviter.username}</p>
              <p className="text-sm">
                Status:{" "}
                <span className={
                  inv.status === "PENDING" ? "text-yellow-600 font-medium" :
                    inv.status === "ACCEPTED" ? "text-green-600 font-medium" :
                      "text-red-600 font-medium"
                }>
                  {inv.status}
                </span>
              </p>

            </div>
          </div>
          <div className="flex gap-2">
  {inv.status === "PENDING" && (
    <>
      <button
        onClick={() => respond(inv.id, "accept")}
        className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
      >
        Accept
      </button>

      <button
        onClick={() => setConfirmDeclineId(inv.id)}
        className="px-4 py-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded"
      >
        Decline
      </button>
    </>
  )}

  {/* Delete luôn hiển thị */}
  <button
    onClick={() => setConfirmDeleteId(inv.id)}
    className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
  >
    Delete
  </button>
</div>

        </div>
      ))}

      {(confirmDeleteId || confirmDeclineId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center space-y-4">
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <p className="text-gray-600">
              You are about to{" "}
              <span className="text-red-600 font-medium">
                {confirmDeleteId ? "delete" : "decline"}
              </span>{" "}
              this invitation.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => {
                  setConfirmDeleteId(null);
                  setConfirmDeclineId(null);
                }}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmDeleteId
                    ? handleDelete(confirmDeleteId)
                    : respond(confirmDeclineId, "decline")
                }
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
