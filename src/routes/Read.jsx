import ReadOnlyContent from "@/components/ReadOnlyContent";
import { useEffect } from "react";
import { useParams } from "react-router";

const Read = () => {
  const { slug } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const handleViewPost = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/posts/${slug}/views`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            method: "POST",
            signal,
          }
        );

        if (!res.ok) {
          const data = await res.json();
          console.log("Error:", data);
          return;
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      }
    };

    handleViewPost();

    return () => {
      controller.abort();
    };
  }, [slug, token]);

  return <ReadOnlyContent slug={slug} />;
};

export default Read;
