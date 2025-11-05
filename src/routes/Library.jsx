import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const Library = () => {
  const token = localStorage.getItem("token");
  const [readlist, setReadlist] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  // Khi cuộn đến phần tử cuối, tăng page
  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // gọi lại mỗi khi page thay đổi
  useEffect(() => {
    getReadlist(page);
  }, [page]);

  async function getReadlist(page) {
    if (!hasMore) return;
    setLoading(true);
    try {
      const data = await axios.get(
        `${import.meta.env.VITE_API_URL}/me/saved-posts?page=${page}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // API giả định trả về { data: [...], hasMore: true }
      setReadlist((prev) => {
        const newItems = data.data.filter(
          (item) => !prev.some((p) => p.id === item.id)
        );
        return [...prev, ...newItems];
      });
      setHasMore(data.hasMore);
    } catch (err) {
      console.log("failed get readlist", err);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-20 container">
      <div className="flex justify-between items-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 pb-2">Your Library</h1>
      </div>

      <div className="space-y-8">
        {readlist.length === 0 && !loading ? (
          <p className="text-gray-500 text-start italic">
            Your library is empty.
          </p>
        ) : (
          readlist.map((list, index) => {
            const isLast = readlist.length === index + 1;
            return (
              <div
                ref={isLast ? lastPostRef : null}
                key={list.id}
                className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-6"
              >
                <PostItem list={list} />
              </div>
            );
          })
        )}

        {loading && <p className="text-gray-400 text-center">Loading...</p>}
      </div>
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
