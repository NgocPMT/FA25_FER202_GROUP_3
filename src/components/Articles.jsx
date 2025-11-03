// Nhan
import { useEffect, useState } from "react";
import Article from "../components/Article";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = `${import.meta.env.VITE_API_URL}/posts?page=1&limit=100&search=`;

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
    <div className="space-y-8">
      {articles.map((post) => (
        <Article key={post.id} data={post} />
      ))}
    </div>
  );
};

export default Articles;
