import { useEffect, useState } from "react";
import axios from "axios";
import { BsBookmarkFill, BsThreeDots } from "react-icons/bs";
import Article from "../components/Article";
import useSavedPosts from "../hooks/useSavedPosts";

const Library = () => {
  const token = localStorage.getItem("token");
 const { toggleSave } = useSavedPosts();

  const [readlist, setReadlist] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getReadlist(page);
  }, [page]);

  async function getReadlist(currentPage) {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/me/saved-posts?page=${currentPage}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const next = await axios.get(
        `${import.meta.env.VITE_API_URL}/me/saved-posts?page=${currentPage+1}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data;
      setReadlist(data);
      setHasNext(data.length === limit && next.data.length != 0);
    } catch (err) {
      console.log("Failed to get readlist:", err);
    }
    setLoading(false);
  }

  async function deleteSavedPost(postId) {
    try {
        await toggleSave(postId);
        await getReadlist(page);
    } catch (err) {
      console.log("Toggle save error:", err);
    }
  }

  function handleDeletePost(deletedId) {
    setReadlist((prev) => prev.filter((p) => p.id !== deletedId));
  }

  return (
    <div className="max-w-3xl mx-auto py-20 container">
      {/* Header */}
      <div className="flex justify-between items-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 pb-2">Your Library</h1>
      </div>

      {/* Danh sách bài viết */}
      <div className="space-y-8">
        {readlist.length === 0 && !loading ? (
          <p className="text-gray-500 italic">Your library is empty.</p>
        ) : (
          readlist.map((post) => {
            return <Article 
              key={post.id} 
              data={post.post} 
              isSaved={true} 
              onSave={() => deleteSavedPost(post.postId)}
              onDelete={handleDeletePost} />
          })
        )}

        {loading && (
          <p className="text-gray-400 text-center mt-4">Loading...</p>
        )}
      </div>

      {/* Pagination */}
      {readlist.length > 0 && (
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
    </div>
  );
};

export default Library;
