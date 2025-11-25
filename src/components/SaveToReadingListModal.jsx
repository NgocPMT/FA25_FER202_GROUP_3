import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function SaveToReadingListModal({ postId, onClose }) {
    const token = localStorage.getItem("token");
    const [readingLists, setReadingLists] = useState([]);
    const [newListName, setNewListName] = useState("");

    async function fetchLists() {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/reading-lists`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReadingLists(data);
    }

    useEffect(() => {
        fetchLists();
    }, []);

    async function handleCreateList() {
        if (!newListName.trim()) return toast.error("Name required!");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/reading-lists`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: newListName })
        });

        if (!res.ok) return toast.error("Failed to create list");

        await fetchLists();
        setNewListName("");
        toast.success("Reading list created!");
    }

    async function handleSave(listId) {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/me/reading-lists/${listId}/saved-posts`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ postId })
            }
        );

        if (!res.ok) {
            const data = await res.json();

            if (
                res.status === 409 ||
                data.error?.toLowerCase().includes("unique constraint") ||
                data.message?.toLowerCase().includes("unique constraint")
            ) {
                return toast.error("You already saved this post to this reading list!");
            }

            return toast.error(data.error || data.message || "Failed to save");
        }

        toast.success("Saved to reading list!");
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg w-80">
                <h3 className="text-lg font-semibold mb-3">Save to reading list</h3>
                <div className="mb-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                    {readingLists.map(list => (
                        <button
                            key={list.id}
                            className="w-full px-3 py-2 border rounded hover:bg-gray-50 text-left"
                            onClick={() => handleSave(list.id)}
                        >
                            <span className="block truncate whitespace-nowrap overflow-hidden">
                                {list.name}
                            </span>
                        </button>

                    ))}
                </div>

                <div className="flex gap-2 mb-4">
                    <input
                        className="border px-2 py-1 rounded w-full"
                        placeholder="New list name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />
                    <button
                        onClick={handleCreateList}
                        className="px-3 py-1 bg-black text-white rounded"
                    >
                        +
                    </button>
                </div>

                <button onClick={onClose} className="text-gray-500 hover:text-black">
                    Close
                </button>
            </div>
        </div>
    );
}
