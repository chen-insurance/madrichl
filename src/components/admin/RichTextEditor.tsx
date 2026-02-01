import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Undo,
  Redo,
  Sparkles,
  Puzzle,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AIAssistModal from "./AIAssistModal";
import InsertWidgetModal from "./InsertWidgetModal";

// No conversion needed - shortcodes are stored and displayed as plain text {{shortcode}}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "right",
      }),
      Placeholder.configure({
        placeholder: "התחילו לכתוב את תוכן המאמר...",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
        dir: "rtl",
      },
    },
  });

  // Fix: Watch for content prop changes and update editor when content differs
  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getHTML();
      // Only update if content is different (avoid loops)
      if (currentContent !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  const handleAIInsert = (text: string) => {
    editor.chain().focus().insertContent(text).run();
  };

  const handleWidgetInsert = (shortcode: string, _displayName: string) => {
    // Insert raw shortcode text only - no HTML wrapping
    editor.chain().focus().insertContent(shortcode).run();
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      className="h-8 w-8 p-0"
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-input bg-muted/30">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="מודגש"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="נטוי"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="כותרת 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="כותרת 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="כותרת 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="רשימה"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="רשימה ממוספרת"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="ציטוט"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="יישור לימין"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="יישור למרכז"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="יישור לשמאל"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={editor.isActive("link") ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              title="קישור"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Input
                placeholder="הזינו כתובת URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                dir="ltr"
              />
              <Button size="sm" onClick={addLink}>
                הוספת קישור
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="תמונה"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Input
                placeholder="הזינו כתובת URL של התמונה"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                dir="ltr"
              />
              <Button size="sm" onClick={addImage}>
                הוספת תמונה
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Insert Widget Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowWidgetModal(true)}
          className="h-8 px-3 gap-1 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50"
          title="הוספת ווידג׳ט"
        >
          <Puzzle className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">ווידג׳ט</span>
        </Button>

        {/* AI Assist Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAIAssist(true)}
          className="h-8 px-3 gap-1 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/30 hover:border-accent/50"
          title="עוזר AI"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium">AI</span>
        </Button>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="בטל"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="בצע שוב"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* AI Assist Modal */}
      <AIAssistModal
        open={showAIAssist}
        onClose={() => setShowAIAssist(false)}
        onInsert={handleAIInsert}
      />

      {/* Insert Widget Modal */}
      <InsertWidgetModal
        open={showWidgetModal}
        onClose={() => setShowWidgetModal(false)}
        onInsert={handleWidgetInsert}
      />
    </div>
  );
};

export default RichTextEditor;
