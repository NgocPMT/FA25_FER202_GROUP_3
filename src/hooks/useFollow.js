import { useState, useCallback } from "react";
import axios from "axios";

export default function useFollow() {
  const token = localStorage.getItem("token");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const checkIfFollowing = useCallback(async (profileId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/me/followings?page=1&limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data.followings || res.data;
      const alreadyFollow = Array.isArray(data)
        ? data.some((f) => f.followingId === Number(profileId))
        : false;

      setIsFollowing(alreadyFollow);
    } catch (err) {
      console.error("Error check following:", err.response?.data || err.message);
    }
  }, [token]);

  // get number of follower
  const getFollower = useCallback(async (username) => {
    try {
      const route = username
        ? `users/user/${username}/followers`
        : "me/followers";
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/${route}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowerCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.error("Error get followers:", err);
    }
  }, [token]);

  const toggleFollow = useCallback(async (profileId) => {
    if (!profileId) return;
    try {
      if (isFollowing) {
        // Unfollow
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/me/followings/${profileId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(false);
        setFollowerCount((prev) => Math.max(0, prev - 1));
      } else {
        // Follow
        await axios.post(
          `${import.meta.env.VITE_API_URL}/me/followings`,
          { followingId: Number(profileId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Toggle follow error:", err.response?.data || err.message);
    }
  }, [isFollowing, token]);

  return {
    isFollowing,
    followerCount,
    setFollowerCount,
    checkIfFollowing,
    getFollower,
    toggleFollow,
  };
}
