import { useEffect, useState } from "react";
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

const ReadOnlyContent = ({ slug }) => {
  const [post, setPost] = useState(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    document.body.classList.add("page-no-scroll");
    return () => {
      document.body.classList.remove("page-no-scroll");
    };
  }, []);

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
    const fetchPost = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
      const post = await res.json();

      console.log(post);
      setPost(post);

      if (editor && post.content) {
        editor.commands.setContent(post.content);
      }
    };
    fetchPost();
  }, [slug, editor]);

  if (!editor) return <p>Loading...</p>;

  return (
    editor &&
    post && (
      <div className="simple-editor-wrapper mt-6">
        <EditorContext.Provider value={{ editor }}>
          <div className="simple-editor-title-wrapper">
            <h1 className="simple-editor-title">{post.title}</h1>
            <div className="mt-5 flex gap-3 items-center text-sm">
              <img
                src={
                  post.user.Profile.avatarUrl ||
                  "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-iconn.png"
                }
                className="rounded-full size-8"
              />
              <p>{post.user.Profile.name}</p>
              <button className="ring rounded-full py-1.5 px-3 cursor-pointer">
                Follow
              </button>
              <p>&middot;</p>
              <p>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
            </div>
            <div className="mt-10 flex gap-3 items-center justify-between text-xs border-t border-b border-gray-300 py-3">
              <div className="flex gap-3 text-gray-600">
                <p className=" hover:text-black transition cursor-pointer flex gap-2 items-center">
                  <VscReactions className="size-6" />
                  <span>{0}</span>
                </p>
                <p className="hover:text-black transition cursor-pointer flex gap-2 items-center">
                  <FaRegComments className="size-5" />
                  <span>{post.comments.length}</span>
                </p>
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
                    <div className="absolute ring ring-gray-300 rounded-sm shadow-lg bg-white p-2 right-0 w-fit z-20">
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
    )
  );
};

export default ReadOnlyContent;
