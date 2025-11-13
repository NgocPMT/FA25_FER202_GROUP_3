import { useEffect, useState, useCallback } from "react";

export default function useSavedPosts() {
  const token = localStorage.getItem("token");
  const [savedPosts, setSavedPosts] = useState([]);

  const getSavedPosts = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/me/saved-posts?page=1&limit=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to get saved posts");
      }

      const data = await res.json();

      // backend có thể trả:
      // { posts: [...] } hoặc trực tiếp [...]
      setSavedPosts(data.posts || data);

    } catch (err) {
      console.log("Error get saved posts:", err.message);
    }
  }, [token]);

  const toggleSave = useCallback(async (postId) => {
    try {
      const isSaved = savedPosts.some((p) => p.postId === postId);

      if (isSaved) {
        // --- UNSAVE ---
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/saved-posts/${postId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to unsave post");
        }

      } else {
        // --- SAVE ---
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/saved-posts`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId }),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to save post");
        }
      }

      await getSavedPosts();

    } catch (err) {
      console.log("Toggle save error:", err.message);
    }
  }, [savedPosts, token, getSavedPosts]);


  useEffect(() => {
    getSavedPosts();
  }, [getSavedPosts]);

  return {
    savedPosts,
    toggleSave,
    refreshSaved: getSavedPosts,
    savedIds: new Set(savedPosts.map(p => p.postId))
  };
}
