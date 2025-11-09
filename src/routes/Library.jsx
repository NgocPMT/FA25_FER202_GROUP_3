import { useEffect, useState } from "react";
import axios from "axios";

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // API có thể trả về mảng trực tiếp hoặc { data: [...] }
      const data = res.data.data || res.data;
      setReadlist(data);

      // Kiểm tra xem có trang kế không (nếu ít hơn limit thì hết)
      setHasNext(data.length === limit);
    } catch (err) {
      console.log("Failed to get readlist:", err);
    }
    setLoading(false);
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
              key={list.id}
              className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-6"
            >
              <PostItem list={list} />
            </div>
          ))
        )}

        {loading && (
          <p className="text-gray-400 text-center mt-4">Loading...</p>
        )}
      </div>

      {/* 🔹 Nút phân trang giống Profile */}
      {readlist.length > 0 && (
        <div className="flex justify-center mt-6 gap-3">
          {/* Prev */}
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

          {/* Next */}
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

function PostItem({ list }) {
  const post = list.post;
  return (
    <>
      <div className="flex-1 pr-4">
        <p className="text-sm text-gray-500 mb-1">
          In{" "}
          <span className="font-semibold">
            {post.publication?.name || "Independent"}
          </span>{" "}
          by {post.user?.username || "Unknown"}
        </p>

        <a
          href={`/posts/${post.slug}`}
          className="block text-xl font-bold text-gray-900 hover:underline"
        >
          {post.title}
        </a>

        <span className="text-gray-700 text-sm mt-1">
          {post.updatedAt
            ? new Date(post.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>
      </div>

      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-40 h-28 object-cover rounded-md mt-4 md:mt-0"
        />
      )}
    </>
  );
}

export default Library;
