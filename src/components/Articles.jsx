import { useEffect, useState } from "react";
import Article from "../components/Article";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("For you");

  const API_URL = `${import.meta.env.VITE_API_URL}/posts?page=1&limit=100&search=`;
  const tabs = ["For you", "Featured"];
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        console.log("✅ API DATA:", data);
        setArticles(data);
      } catch (err) {
        console.error("❌ API ERROR:", err);
        setError("Không thể tải dữ liệu bài viết");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <p>⏳ Đang tải...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (

    <div className="px-6 py-4">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-lg font-medium relative ${activeTab === tab
              ? "text-black after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black"
              : "text-gray-500 hover:text-gray-800"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {articles.map((post) => (
          <Article key={post.id} data={post} />
        ))}
      </div>
    </div>
  );
};

export default Articles;
