"use client";

import * as React from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- UI Primitives ---
import { Button } from "components/tiptap-ui-primitive/button";
import { Spacer } from "components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "components/tiptap-ui/link-popover";
import { MarkButton } from "components/tiptap-ui/mark-button";
import { TextAlignButton } from "components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "components/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsMobile } from "hooks/use-mobile";
import { useWindowSize } from "hooks/use-window-size";
import { useCursorVisibility } from "hooks/use-cursor-visibility";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";

import { Input } from "@/components/tiptap-ui-primitive/input";
import { RxAvatar } from "react-icons/rx";
import { MdOutlineMoreHoriz } from "react-icons/md";
import { Link, useLocation } from "react-router";
import TopicSelector from "@/components/TopicSelector";
import AIWritingAssistant from "@/components/AIWritingAssistant.jsx";

const MainToolbarContent = ({ onHighlighterClick, onLinkClick, isMobile }) => {
  return (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>
      <Spacer />
      {isMobile && <ToolbarSeparator />}
    </>
  );
};

const MobileToolbarContent = ({ type, onBack }) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export const SimpleEditor = React.forwardRef(
  (
    {
      title,
      onTitleChange,
      handlePublish,
      handleAutoSave,
      isAvatarDropdownShow,
      toggleAvatarDropdownShow,
      logOut,
      content,
      selectedTopics,
      setSelectedTopics,
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const { height } = useWindowSize();
    const [mobileView, setMobileView] = React.useState("main");
    const toolbarRef = React.useRef(null);
    const location = useLocation();
    const previousPath = React.useRef(location.pathname);
    const lastSegment = location.pathname.split("/").filter(Boolean).pop();

    const editor = useEditor({
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      content: content ? content : "",
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          "aria-label": "Main content area, start typing to enter text.",
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
        ImageUploadNode.configure({
          accept: "image/*",
          maxSize: MAX_FILE_SIZE,
          limit: 3,
          upload: handleImageUpload,
          onError: (error) => console.error("Upload failed:", error),
        }),
      ],
    });

    React.useImperativeHandle(ref, () => ({
      getContent: () => editor?.getJSON(),
    }));

    // Function to get editor content for AI Assistant
    const getEditorContent = React.useCallback(() => {
      return editor?.getJSON();
    }, [editor]);

    React.useEffect(() => {
      if (!handleAutoSave || !editor) return;

      let controller = new AbortController();
      let signal = controller.signal;

      let prevContent = JSON.stringify(editor.getJSON());

      const autoSave = async () => {
        const currentContent = JSON.stringify(editor.getJSON());

        if (currentContent !== prevContent) {
          prevContent = currentContent;
          await handleAutoSave(editor.isEmpty, signal);
        }
      };

      const timer = setInterval(autoSave, 10000);

      return () => {
        controller.abort();
        clearInterval(timer);
      };
    }, [handleAutoSave, editor]);

    const rect = useCursorVisibility({
      editor,
      overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
    });

    React.useEffect(() => {
      if (!isMobile && mobileView !== "main") {
        setMobileView("main");
      }
    }, [isMobile, mobileView]);

    return (
      <div className="simple-editor-wrapper">
        <EditorContext.Provider value={{ editor }}>
          <nav className="flex justify-between max-w-5xl py-2 px-4 md:mx-auto mb-5">
            <Link to="/home" className="font-bold text-3xl font-lora">
              Easium
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePublish(editor.isEmpty)}
                className="bg-green-700 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-green-800"
              >
                Publish
              </button>
              <div className="relative w-8 h-8">
                <button
                  onClick={toggleAvatarDropdownShow}
                  className="w-full h-full rounded-full flex items-center justify-center text-white font-bold cursor-pointer flex-shrink-0 overflow-hidden"
                >
                  <MdOutlineMoreHoriz className="w-full h-full text-black" />
                </button>
                {isAvatarDropdownShow && (
                  <div className="bg-white top-10 right-0 absolute w-fit z-50 text-sm px-3 py-1 ring ring-gray-300 shadow-lg rounded-sm">
                    <div className="mb-2">
                      <Link
                        to="/home"
                        className="cursor-pointer hover:bg-gray-400 p-1 whitespace-nowrap text-end inline-block w-full"
                      >
                        Home
                      </Link>
                      <Link
                        to="/library"
                        className="cursor-pointer hover:bg-gray-400 p-1 whitespace-nowrap text-end inline-block w-full"
                      >
                        Library
                      </Link>
                      <Link
                        to="/profile"
                        className="cursor-pointer hover:bg-gray-400 p-1 whitespace-nowrap text-end inline-block w-full"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/stories"
                        className="cursor-pointer hover:bg-gray-400 p-1 whitespace-nowrap text-end inline-block w-full"
                      >
                        Stories
                      </Link>
                      <Link
                        to="/following"
                        className="cursor-pointer hover:bg-gray-400 p-1 whitespace-nowrap text-end inline-block w-full"
                      >
                        Followings
                      </Link>
                      <hr />
                    </div>
                    <button
                      onClick={logOut}
                      className="cursor-pointer hover:bg-gray-400 p-1 whitespace-nowrap text-end inline-block w-full"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {}),
            }}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>
          <div className="px-4 max-w-5xl mx-auto my-4">
            <TopicSelector
              selectedTopics={selectedTopics}
              setSelectedTopics={setSelectedTopics}
            />
          </div>
          <div className="simple-editor-title-wrapper">
            <Input
              type="text"
              placeholder="Enter title..."
              value={title}
              onChange={onTitleChange}
              className="simple-editor-title"
            />
          </div>
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />

          {/* AI Writing Assistant */}
          <AIWritingAssistant
            title={title}
            getEditorContent={getEditorContent}
          />
        </EditorContext.Provider>
      </div>
    );
  }
);
