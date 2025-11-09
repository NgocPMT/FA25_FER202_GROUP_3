import { useEffect, useState } from "react";
import axios from "axios";
import { BsBookmarkFill, BsThreeDots } from "react-icons/bs";

// ✅ Component chính
const Library = () => {
  const token = localStorage.getItem("token");
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
      const data = res.data.data || res.data;
      setReadlist(data);
      setHasNext(data.length === limit);
    } catch (err) {
      console.log("Failed to get readlist:", err);
    }
    setLoading(false);
  }

  async function handleUnsave(postId) {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/me/saved-posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReadlist((prev) => prev.filter((item) => item.postId !== postId));
    } catch (err) {
      console.log("Error unsaving post:", err);
    }
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
          readlist.map((list) => (
            <div
              key={list.id || list.postId}
              className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-6 min-h-[120px]"
            >
              <PostItem list={list} onUnsave={handleUnsave} />
            </div>
          ))
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
            className={`px-3 py-1 rounded-full bg-white transition ${
              page === 1
                ? "invisible"
                : "cursor-pointer opacity-40 hover:opacity-60"
            }`}
          >
            Prev
          </button>

          <span className="px-3 py-1 opacity-70">{page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1 rounded-full bg-white transition ${
              !hasNext
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

// ✅ Hàm rút gọn title
const formatTitle = (title) => {
  if (!title) return "Untitled";
  if (title.length <= 50) return title;
  if (title.length <= 80) {
    return (
      <>
        {title.slice(0, 50)}
        <br />
        {title.slice(50)}
      </>
    );
  }
  return (
    <>
      {title.slice(0, 100)}
      ...
    </>
  );
};

// ✅ Component hiển thị từng bài viết
function PostItem({ list, onUnsave }) {
  const post = list.post;

  return (
    <div className="flex justify-between items-stretch w-full gap-4">
      {/* Bên trái - Tiêu đề + Ngày + Nút */}
      <div className="flex flex-col justify-between flex-1">
        {/* Tiêu đề */}
        <div>
          <a
            href={`/posts/${post.slug}`}
            className="block text-xl font-bold text-gray-900 hover:underline leading-snug"
          >
            {formatTitle(post.title)}
          </a>
        </div>

        {/* Ngày tháng và nút */}
        <div className="mt-auto pt-4 flex justify-between items-center">
          <span className="text-gray-700 text-sm">
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : ""}
          </span>

          <div className="flex items-center gap-4">
            <BsBookmarkFill
              className="cursor-pointer text-black hover:opacity-60"
              onClick={() => onUnsave(list.postId || post.id)}
              title="Remove from Library"
            />
            <BsThreeDots className="cursor-pointer hover:text-black" />
          </div>
        </div>
      </div>

      {/* Bên phải - Ảnh hoặc placeholder */}
      <div className="w-40 h-28 mt-4 md:mt-0 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No Image
          </div>
        )}
      </div>
    </div>
  );
}

export default Library;
