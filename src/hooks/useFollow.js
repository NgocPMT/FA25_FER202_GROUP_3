import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export default function useFollow() {
  const token = localStorage.getItem("token");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const checkIfFollowing = useCallback(async (profileId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/me/followings?page=1&limit=1000`,
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
        throw new Error(errData.message || "Failed to check following");
      }

      const json = await res.json();
      const data = json.followings || json;

      const alreadyFollow = Array.isArray(data)
        ? data.some((f) => f.followingId === Number(profileId))
        : false;

      setIsFollowing(alreadyFollow);

    } catch (err) {
      console.error("Error check following:", err.message);
    }
  }, [token]);

  // get number of follower
  const getFollower = useCallback(async (username) => {
    try {
      const route = username
        ? `users/user/${username}/followers`
        : "me/followers";

      const res = await fetch(`${import.meta.env.VITE_API_URL}/${route}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch followers");
      }

      const data = await res.json();

      setFollowerCount(Array.isArray(data) ? data.length : 0);

    } catch (err) {
      console.error("Error get followers:", err.message);
    }
  }, [token]);

  // Handle follow
  const toggleFollow = useCallback(async (profileId) => {
    if (!profileId) return;

    try {
      if (isFollowing) {
        // Unfollow
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/followings/${profileId}`,
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
          toast.error("Unfollow Failed");
          throw new Error(errData.message || "Failed to unfollow");
        }

        setIsFollowing(false);
        setFollowerCount((prev) => Math.max(0, prev - 1));
        toast.success("Unfollow successfully!");

      } else {
        // Follow
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/followings`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ followingId: Number(profileId) }),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          toast.error("Follow Failed");
          throw new Error(errData.message || "Failed to follow");
        }

        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
        toast.success("Follow successfully!");
      }

    } catch (err) {
      console.error("Toggle follow error:", err.message);
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
