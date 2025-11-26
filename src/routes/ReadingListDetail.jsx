import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BsX } from "react-icons/bs";
import { toast } from "react-toastify";
import Article from "../components/Article";
import ModalPortal from "@/components/ModalPortal";

const ReadingListDetail = () => {
    const { id } = useParams();
    const token = localStorage.getItem("token");

    const [posts, setPosts] = useState([]);
    const [listInfo, setListInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [confirmModal, setConfirmModal] = useState(false);
    const [postToRemove, setPostToRemove] = useState(null);
    // If reading list name are too long
    const [showFullName, setShowFullName] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const limit = 5;
    const totalPages = Math.ceil(posts.length / limit);
    const currentPosts = posts.slice((page - 1) * limit, page * limit);
    const hasNext = page < totalPages;

    useEffect(() => {
        fetchReadingListDetail();
    }, [id]);

    // Get all reading lists
    async function fetchReadingListDetail() {
        try {
            const res1 = await fetch(`${import.meta.env.VITE_API_URL}/me/reading-lists`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const lists = await res1.json();
            const selected = lists.find(l => l.id === Number(id));
            setListInfo(selected);

            const res2 = await fetch(
                `${import.meta.env.VITE_API_URL}/me/reading-lists/${id}/saved-posts`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const data2 = await res2.json();
            setPosts(data2);
        } catch (err) {
            console.log(err.message);
        }
        setLoading(false);
    }

    // Remove post button
    async function handleRemove(savedPostId) {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/me/reading-lists/${id}/saved-posts/${savedPostId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (!res.ok) {
                toast.error("Failed to remove post");
                return;
            }

            setPosts(prev => prev.filter(item => item.id !== savedPostId));
            toast.success("Removed from reading list!");
        } catch (err) {
            toast.error("Error removing post");
        }
    }

    if (loading) return <p className="text-center mt-10">Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto py-20">
            <div className="flex items-center gap-2 mb-6">
                <h1 className="text-3xl font-bold max-w-[250px] truncate">
                    {listInfo?.name}
                </h1>
                {listInfo?.name?.length > 25 && (
                    <button
                        onClick={() => setShowFullName(true)}
                        className="text-black hover:underline text-sm"
                    >
                        More
                    </button>
                )}
            </div>

            {showFullName && (
                <ModalPortal>
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
                        <div className="bg-white p-6 rounded-lg w-80 shadow-lg text-center">
                            <h2 className="text-lg font-semibold mb-4">Reading List Name</h2>
                            <p className="text-gray-800 break-words mb-6">{listInfo?.name}</p>

                            <button
                                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                                onClick={() => setShowFullName(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* View Saved Post */}
            {posts.length === 0 ? (
                <p className="text-gray-500 italic">No saved posts in this list.</p>
            ) : (
                currentPosts.map((item) => {
                    const post = item.post;
                    return (
                        <div key={item.id} className="relative pt-4">
                            <Article
                                data={post}
                                mode="reading-list"
                                isSaved={true}
                            />
                            <button
                                onClick={() => {
                                    setPostToRemove(item.id);
                                    setConfirmModal(true);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 hover:cursor-pointer p-2 rounded-full"
                                title="Remove from reading list"
                            >
                                <BsX size={22} />
                            </button>
                        </div>
                    );
                }))}

            {/* Pagination */}
            {posts.length > 0 && (
                <div className="flex justify-center mt-6 gap-3">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={`px-3 py-1 rounded-full bg-white transition ${page === 1
                                ? "invisible"
                                : "cursor-pointer opacity-40 hover:opacity-60"
                            }`}
                    >
                        Prev
                    </button>

                    <span className="px-3 py-1 opacity-70">{page}</span>

                    <button
                        onClick={() => setPage((p) => p + 1)}
                        className={`px-3 py-1 rounded-full bg-white transition ${!hasNext
                                ? "invisible"
                                : "cursor-pointer opacity-40 hover:opacity-60"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {confirmModal && (
                <ModalPortal>
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
                        <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
                            <h2 className="font-semibold text-lg mb-3">Remove Post</h2>

                            <p className="text-gray-600 mb-5">
                                Are you sure you want to remove this post from the reading list?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 text-gray-600 hover:text-black"
                                    onClick={() => {
                                        setConfirmModal(false);
                                        setPostToRemove(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={() => {
                                        handleRemove(postToRemove);
                                        setConfirmModal(false);
                                        setPostToRemove(null);
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default ReadingListDetail;
