import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function useSavedPosts() {
  const token = localStorage.getItem("token");
  const [savedPosts, setSavedPosts] = useState([]);

  const getSavedPosts = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/me/saved-posts?page=1&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedPosts(res.data.posts || res.data);
    } catch (err) {
      console.log("Error get saved posts:", err);
    }
  }, [token]);

  const toggleSave = useCallback(async (postId) => {
    try {
      const isSaved = savedPosts.some((p) => p.postId === postId);
      if (isSaved) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/me/saved-posts/${postId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/me/saved-posts`,
          { postId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await getSavedPosts();
    } catch (err) {
      console.log("Toggle save error:", err);
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
