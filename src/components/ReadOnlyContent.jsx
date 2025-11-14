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
import { CiBookmark } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { useLoader } from "@/context/LoaderContext";
import CommentPost from "@/components/CommentPost";
import { Link, useNavigate } from "react-router";
import { useOutletContext } from "react-router";
import { toast } from "react-toastify";

const ReadOnlyContent = ({ slug }) => {
  const { setIsCommentOpen, isCommentOpen } = useOutletContext();
  const [post, setPost] = useState(null);
  // const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [reactions, setReactions] = useState(null);
  const [isReactionShow, setIsReactionShow] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const token = localStorage.getItem("token");
  const userId =
    localStorage.getItem("userId") && parseInt(localStorage.getItem("userId"));
  const [reactedType, setReactedType] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false); // ✅ trạng thái follow
  const [loadingFollow, setLoadingFollow] = useState(false);
  const navigate = useNavigate();

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
    document.body.classList.add("page-no-scroll");
    return () => {
      document.body.classList.remove("page-no-scroll");
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchReactions = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      setReactions(data.reactions);
    };

    fetchReactions();
  }, []);

  const toggleReactionShow = () => {
    setIsReactionShow(!isReactionShow);
  };

  const handleReaction = async (reactionTypeId) => {
    showLoader();
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
    const reacted = await res.json();
    setReactedType(reacted.reacted.reactionType.name);
    hideLoader();
  };

  const handleRemoveReaction = async () => {
    showLoader();
    await fetch(`${import.meta.env.VITE_API_URL}/posts/${post.id}/reactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "DELETE",
    });
    setReactedType(null);
    hideLoader();
  };

  const ReactionCount = ({ keyword }) => {
    const count = post?.PostReaction.reduce(
      (counts, reaction) =>
        reaction.reactionType.name === keyword ? counts + 1 : counts,
      0
    );
    return (
      count > 0 && (
        <p className="flex gap-2 text-gray-600 items-center">
          <img
            src={`https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/reactions/facebook-${keyword}.svg`}
            className="size-5"
          />
          <span
            className={`${
              reactedType === keyword ? "font-bold text-green-500" : ""
            }`}
          >
            {count}
          </span>
        </p>
      )
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

        const reacted = data.PostReaction.find(
          (reaction) => reaction.userId === userId
        );
        setReactedType(reacted?.reactionType.name);

        if (!signal.aborted && editor && data.content) {
          editor.commands.setContent(data.content);
        }

        // --- Fetch follow status only if logged in ---
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
              console.warn("Không thể kiểm tra trạng thái follow.", err);
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Lỗi fetch post", err);
        }
      }
    };

    fetchPost();

    return () => {
      controller.abort(); // cleanup → stop all pending fetches
    };
  }, [slug, editor]);

  const handleFollowToggle = async () => {
    if (!token) {
      toast.error("You must login to follow authors");
    }

    const targetId = post?.user?.id || post?.userId;
    if (!targetId) {
      console.warn("❌ Không tìm thấy ID người dùng trong post:", post);
      toast.error("Something went wrong please try again");
      return;
    }

    try {
      setLoadingFollow(true);

      if (!isFollowing) {
        // ✅ FOLLOW
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
        console.log("Follow API result:", result);

        if (!res.ok) {
          if (result.error === "You have followed this user") {
            console.warn("⚠️ Already followed, updating state.");
            setIsFollowing(true);
            return;
          }
          throw new Error(result.message || result.error || "Follow failed");
        }

        setIsFollowing(true);
      } else {
        // ✅ UNFOLLOW
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
      }
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
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

                {/* ✅ Nút Follow / Unfollow */}
                <button
                  onClick={handleFollowToggle}
                  disabled={loadingFollow}
                  className={`ring rounded-full py-1.5 px-3 cursor-pointer transition ${
                    isFollowing
                      ? "bg-gray-100 text-gray-700 border hover:bg-gray-200" // ✅ kiểu "Unfollow"
                      : "bg-black text-white hover:opacity-80" // ✅ kiểu "Follow"
                  }`}
                >
                  {loadingFollow
                    ? "Loading..."
                    : isFollowing
                    ? "Unfollow" // ✅ đổi chữ thành Unfollow khi đã theo dõi
                    : "Follow"}
                </button>

                <p>&middot;</p>
                <p>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="mt-10 flex gap-3 items-center justify-between text-xs border-t border-b border-gray-300 py-3">
                <div className="flex gap-3 text-gray-600">
                  {reactions && !reactedType && (
                    <div className="relative">
                      <button
                        onClick={toggleReactionShow}
                        className=" hover:text-black transition cursor-pointer flex items-center"
                      >
                        <VscReactions className="size-6" />
                      </button>
                      {isReactionShow && (
                        <div className="absolute left-0 p-2 ring ring-gray-300 rounded-sm shadow-lg bg-white flex gap-3 items-center w-fit z-20">
                          {reactions.map((reaction) => (
                            <button
                              key={reaction.id}
                              onClick={() => handleReaction(reaction.id)}
                              className="p-2 group cursor-pointer"
                            >
                              <img
                                src={reaction.reactionImageUrl}
                                alt={reaction.name}
                                className="size-5 inline-block transition-all group-hover:-translate-y-0.5"
                              />
                              <p className="text-gray-700 mt-2">
                                {reaction.name}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <ReactionCount keyword="like" />
                  <ReactionCount keyword="love" />
                  <ReactionCount keyword="haha" />
                  <ReactionCount keyword="sad" />
                  <ReactionCount keyword="wow" />
                  <ReactionCount keyword="angry" />
                  <button
                    onClick={openCommentSidebar}
                    className="hover:text-black transition cursor-pointer flex gap-2 items-center"
                  >
                    <FaRegComments className="size-5" />
                    <span>{post.comments.length}</span>
                  </button>
                </div>
                <div className="flex gap-3 text-gray-600">
                  <button className=" hover:text-black transition cursor-pointer">
                    <CiBookmark className="size-5" />
                  </button>
                  <div className="relative">
                    <button
                      className="hover:text-black transition cursor-pointer"
                      onClick={toggleShowMore}
                    >
                      <IoIosMore className="size-5" />
                    </button>
                    {showMore && (
                      <div className="absolute ring ring-gray-300 rounded-sm shadow-lg bg-white p-2 right-0 w-fit z-20 flex flex-col gap-3">
                        <button
                          onClick={handleRemoveReaction}
                          className="w-full text-start text-nowrap cursor-pointer text-gray-600 hover:text-black"
                        >
                          Remove reaction
                        </button>
                        <button className="w-full text-start text-nowrap text-red-600 hover:text-red-700 cursor-pointer">
                          Report this post
                        </button>
                      </div>
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
