import { useEffect, useRef, useState } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";
import { HorizontalRule } from "components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { FaRegComments } from "react-icons/fa";
import { VscReactions } from "react-icons/vsc";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { IoIosMore } from "react-icons/io";
import CommentPost from "@/components/CommentPost";
import { Link, useNavigate } from "react-router";
import { useOutletContext } from "react-router";
import { toast } from "react-toastify";
import useSavedPosts from "@/hooks/useSavedPosts";
import ModalPortal from "./ModalPortal";
import SaveToReadingListModal from "./SaveToReadingListModal";

const ReadOnlyContent = ({ slug }) => {
  const { setIsCommentOpen, isCommentOpen } = useOutletContext();
  const [post, setPost] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [isReactionShow, setIsReactionShow] = useState(false);
  const [reactionSearch, setReactionSearch] = useState("");
  const [showAllReactions, setShowAllReactions] = useState(false);
  const token = localStorage.getItem("token");
  const userId =
    localStorage.getItem("userId") && parseInt(localStorage.getItem("userId"));
  const [userReaction, setUserReaction] = useState(null); // Changed: stores full reaction object
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const navigate = useNavigate();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [topicMap, setTopicMap] = useState({});

  const filteredReactions = reactionSearch
    ? reactions.filter((reaction) => reaction.name.includes(reactionSearch))
    : reactions;

  const openCommentSidebar = () => {
    setIsCommentOpen(true);
  };

  const handleCommentChange = (action, id) => {
    if (action === "add") {
      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, { id }],
      }));
    } else if (action === "delete") {
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== id),
      }));
    }
  };

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/topics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        const map = {};
        data.forEach((t) => (map[t.id] = t.name));

        setTopicMap(map);
      } catch (err) {
        console.error("Failed to load topics:", err);
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    document.body.classList.add("page-no-scroll");
    return () => {
      document.body.classList.remove("page-no-scroll");
    };
  }, []);

  const fetchReactions = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/reactions`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setReactions(data || []);
    } catch (err) {
      console.error("Failed to fetch reactions:", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchReactions();
  }, []);

  const toggleReactionShow = () => {
    setIsReactionShow(!isReactionShow);
    if (!isReactionShow) {
      setReactionSearch(""); // Reset search when opening
    }
  };

  // Handle adding a reaction
  const handleReaction = async (reactionTypeId) => {
    if (!token) {
      toast.error("You must login to react");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}/reactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ reactionTypeId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to react");
        return;
      }

      // Update post reactions
      setPost((prev) => ({
        ...prev,
        PostReaction: [...prev.PostReaction, data.reacted],
      }));

      // Set user's current reaction
      setUserReaction(data.reacted);
      setIsReactionShow(false);

      toast.success(data.message);
    } catch (err) {
      console.error("Reaction error:", err);
      toast.error("Failed to react. Please try again.");
    }
  };

  // Handle removing a reaction
  const handleRemoveReaction = async () => {
    if (!token) {
      toast.error("You must login to remove reaction");
      return;
    }

    if (!userReaction) {
      toast.info("You haven't reacted to this post");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}/reactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to remove reaction");
        return;
      }

      // Remove reaction from post
      setPost((prev) => ({
        ...prev,
        PostReaction: prev.PostReaction.filter((r) => r.userId !== userId),
      }));

      setUserReaction(null);
      setShowMore(false);

      toast.success(data.message);
    } catch (err) {
      console.error("Remove reaction error:", err);
      toast.error("Failed to remove reaction. Please try again.");
    }
  };

  // Component to display reaction counts summary
  const ReactionsSummary = () => {
    // Group reactions by type
    const reactionCounts = {};
    post?.PostReaction.forEach((reaction) => {
      const typeId = reaction.reactionTypeId;
      if (!reactionCounts[typeId]) {
        reactionCounts[typeId] = {
          count: 0,
          reaction: reaction.reactionType,
        };
      }
      reactionCounts[typeId].count++;
    });

    const sortedReactions = Object.values(reactionCounts).sort(
      (a, b) => b.count - a.count
    );

    // Show top 3 reactions
    const topReactions = sortedReactions.slice(0, 3);
    const remainingCount = sortedReactions
      .slice(3)
      .reduce((sum, r) => sum + r.count, 0);
    const totalCount = post?.PostReaction.length || 0;

    if (totalCount === 0) return null;

    return (
      <div className="flex gap-2 items-center">
        {topReactions.map(({ reaction, count }) => (
          <div key={reaction.id} className="flex items-center gap-1">
            <img
              src={reaction.reactionImageUrl}
              alt={reaction.name}
              className="size-5"
            />
            <span
              className={`text-sm ${userReaction?.reactionTypeId === reaction.id
                  ? "font-bold text-green-600"
                  : "text-gray-600"
                }`}
            >
              {count}
            </span>
          </div>
        ))}

        {sortedReactions.length > 3 && (
          <button
            onClick={() => setShowAllReactions(!showAllReactions)}
            className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
          >
            +{sortedReactions.length - 3} more
          </button>
        )}

        {/* All Reactions Modal */}
        {showAllReactions && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAllReactions(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  All Reactions ({totalCount})
                </h3>
                <button
                  onClick={() => setShowAllReactions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedReactions.map(({ reaction, count }) => (
                  <div
                    key={reaction.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={reaction.reactionImageUrl}
                        alt={reaction.name}
                        className="size-8"
                      />
                      <span className="font-medium">{reaction.name}</span>
                    </div>
                    <span
                      className={`text-lg font-semibold ${userReaction?.reactionTypeId === reaction.id
                          ? "text-green-600"
                          : "text-gray-600"
                        }`}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
    ],
    editable: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPost = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/posts/${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }
        );

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error);
          return navigate("/home");
        }

        const data = await res.json();
        if (signal.aborted) return;

        setPost(data);

        // Find user's reaction if exists
        const reacted = data.PostReaction.find(
          (reaction) => reaction.userId === userId
        );
        setUserReaction(reacted || null);

        if (!signal.aborted && editor && data.content) {
          editor.commands.setContent(data.content);
        }

        // Fetch follow status only if logged in
        if (token && data.userId) {
          try {
            const resFollow = await fetch(
              `${import.meta.env.VITE_API_URL}/me/followings?page=1&limit=9999`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal,
              }
            );

            const followData = await resFollow.json();
            if (signal.aborted) return;

            const list = Array.isArray(followData)
              ? followData.map((item) => item.following)
              : Array.isArray(followData.data)
                ? followData.data.map((item) => item.following)
                : [];

            setIsFollowing(
              list.some((u) => Number(u.id) === Number(data.userId))
            );
          } catch (err) {
            if (err.name !== "AbortError") {
              console.warn("Could not check follow status.", err);
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch post error", err);
        }
      }
    };

    fetchPost();

    return () => {
      controller.abort();
    };
  }, [slug, editor]);

  const handleFollowToggle = async () => {
    if (!token) {
      toast.error("You must login to follow authors");
      return;
    }

    const targetId = post?.user?.id || post?.userId;
    if (!targetId) {
      console.warn("User ID not found in post:", post);
      toast.error("Something went wrong please try again");
      return;
    }

    try {
      setLoadingFollow(true);

      if (!isFollowing) {
        // Follow
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/followings`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ followingId: Number(targetId) }),
          }
        );

        const result = await res.json();

        if (!res.ok) {
          if (result.error === "You have followed this user") {
            console.warn("Already followed, updating state.");
            setIsFollowing(true);
            return;
          }
          throw new Error(result.message || result.error || "Follow failed");
        }

        setIsFollowing(true);
        toast.success("Followed successfully");
      } else {
        // Unfollow
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/followings/${targetId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const result = await res.json().catch(() => ({}));

        if (!res.ok)
          throw new Error(result.message || result.error || "Unfollow failed");

        setIsFollowing(false);
        toast.success("Unfollowed successfully");
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoadingFollow(false);
    }
  };

  if (!editor) return <p>Loading...</p>;

  return (
    <>
      {editor && post && (
        <div className="simple-editor-wrapper mt-6">
          <EditorContext.Provider value={{ editor }}>
            <div className="simple-editor-title-wrapper">
              <h1 className="simple-editor-title">{post.title}</h1>
              {post.postTopics?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.postTopics.map((pt) => (
                    <span
                      key={pt.topicId}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                    >
                      #{topicMap[pt.topicId] || "Unknown topic"}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex gap-3 items-center text-sm">
                <Link
                  className="flex items-center gap-3 group"
                  to={`/profile/${post.user.username}`}
                >
                  <img
                    src={
                      post?.user?.Profile?.avatarUrl ||
                      "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                    }
                    className="rounded-full size-8"
                  />
                  <p className="group-hover:underline">
                    {post.user.Profile.name}
                  </p>
                </Link>

                {/* Follow/Unfollow Button */}
                {post.userId !== userId && (
                <button
                  onClick={handleFollowToggle}
                  disabled={loadingFollow}
                  className={`ring rounded-full py-1.5 px-3 cursor-pointer transition ${isFollowing
                      ? "bg-gray-100 text-gray-700 border hover:bg-gray-200"
                      : "bg-black text-white hover:opacity-80"
                    }`}
                >
                  {loadingFollow
                    ? "Loading..."
                    : isFollowing
                      ? "Unfollow"
                      : "Follow"}
                </button>
                )}
                <p>&middot;</p>
                <p>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>

              {/* Reaction and Comment Bar */}
              <div className="mt-10 flex gap-3 items-center justify-between text-xs border-t border-b border-gray-300 py-3">
                <div className="flex gap-3 text-gray-600 items-center">
                  {/* Reaction Button - Show if user hasn't reacted */}
                  {token && !userReaction && reactions.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={toggleReactionShow}
                        className="hover:text-black transition cursor-pointer flex items-center"
                        title="React to this post"
                      >
                        <VscReactions className="size-6" />
                      </button>

                      {/* Reaction Picker Dropdown - Discord Style */}
                      {isReactionShow && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsReactionShow(false)}
                          />
                          <div className="absolute left-0 top-8 p-3 ring ring-gray-300 rounded-lg shadow-xl bg-white w-80 z-20">
                            {/* Search Input */}
                            <div className="mb-3">
                              <input
                                type="text"
                                placeholder="Search reactions..."
                                value={reactionSearch}
                                onChange={(e) =>
                                  setReactionSearch(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                autoFocus
                              />
                            </div>

                            {/* Reactions Grid */}
                            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                              {reactions.length > 0 ||
                                reactionSearch.trim().length > 0 ? (
                                filteredReactions.map((reaction) => (
                                  <button
                                    key={reaction.id}
                                    onClick={() => handleReaction(reaction.id)}
                                    className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition group cursor-pointer"
                                    title={reaction.name}
                                  >
                                    <img
                                      src={reaction.reactionImageUrl}
                                      alt={reaction.name}
                                      className="size-8 transition-transform group-hover:scale-110"
                                    />
                                    <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                                      {reaction.name}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <div className="col-span-6 text-center py-4 text-gray-500">
                                  No reactions found
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Show user's reaction if they've reacted */}
                  {userReaction && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                      <img
                        src={userReaction.reactionType.reactionImageUrl}
                        alt={userReaction.reactionType.name}
                        className="size-5"
                      />
                      <span className="text-green-600 font-semibold">
                        {userReaction.reactionType.name}
                      </span>
                    </div>
                  )}

                  {/* Display reaction counts summary */}
                  <ReactionsSummary />
                </div>

                <div className="flex gap-3 text-gray-600 items-center">
                  {/* Comments Button - Moved to right side */}
                  <button
                    onClick={openCommentSidebar}
                    className="hover:text-black transition cursor-pointer flex gap-2 items-center"
                  >
                    <FaRegComments className="size-5" />
                    <span>{post.comments.length}</span>
                  </button>

                  <BsBookmark
                    className="cursor-pointer size-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowSaveModal(true);
                    }}
                  />
                  {showSaveModal && (
                    <ModalPortal>
                      <SaveToReadingListModal
                        postId={post.id}
                        onClose={() => setShowSaveModal(false)}
                      />
                    </ModalPortal>
                  )}

                  {/* More Options */}
                  <div className="relative">
                    <button
                      className="hover:text-black transition cursor-pointer"
                      onClick={toggleShowMore}
                    >
                      <IoIosMore className="size-5" />
                    </button>

                    {showMore && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMore(false)}
                        />
                        <div className="absolute ring ring-gray-300 rounded-sm shadow-lg bg-white p-2 right-0 w-fit z-20 flex flex-col gap-1">
                          {userReaction && (
                            <button
                              onClick={handleRemoveReaction}
                              className="w-full text-start text-nowrap cursor-pointer text-gray-600 hover:bg-gray-100 px-3 py-2 rounded"
                            >
                              Remove reaction
                            </button>
                          )}
                          <button className="w-full text-start text-nowrap text-red-600 hover:bg-red-50 cursor-pointer px-3 py-2 rounded">
                            Report this post
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <EditorContent
              editor={editor}
              role="presentation"
              className="simple-editor-content"
            />
          </EditorContext.Provider>
        </div>
      )}
      <CommentPost
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        postId={post?.id}
        postAuthorId={post?.userId}
        onCommentChange={handleCommentChange}
      />
    </>
  );
};

export default ReadOnlyContent;