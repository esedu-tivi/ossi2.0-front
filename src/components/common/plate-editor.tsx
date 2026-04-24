import { useCallback, useEffect, useRef } from "react";
import type { Descendant, Value } from "platejs";
import { KEYS } from "platejs";
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
} from "@platejs/basic-nodes/react";
import { IndentPlugin } from "@platejs/indent/react";
import { ListPlugin } from "@platejs/list/react";
import { LinkPlugin } from "@platejs/link/react";
import { MediaEmbedPlugin, ImagePlugin } from "@platejs/media/react";
import { TrailingBlockPlugin } from "platejs";
import { Plate, PlateContent, usePlateEditor } from "platejs/react";
import { Label } from "@/components/ui/label";
import { toggleList } from "@platejs/list";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Video,
  ImagePlus,
  Image as ImageIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------


interface PlateEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  height?: number;
  maxHeight?: number;
}

interface SlateText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  [key: string]: unknown;
}

interface SlateElement {
  type?: string;
  url?: string;
  listStyleType?: string;
  indent?: number;
  children: (SlateElement | SlateText)[];
  [key: string]: unknown;
}

interface MediaEmbedElementProps {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  element: { url?: string; [key: string]: unknown };
}

interface ImageElementProps {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  element: { url?: string; [key: string]: unknown };
}

interface LinkElementProps {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  element: { url?: string; [key: string]: unknown };
}

interface EditorInstance {
  tf: {
    toggleMark: (mark: string) => void;
    insertNodes: (nodes: unknown[]) => void;
    setValue: (value: Value) => void;
    focus: () => void;
    h1: { toggle: () => void };
    h2: { toggle: () => void };
    h3: { toggle: () => void };
    blockquote: { toggle: () => void };
  };
  api: {
    node: (options: { match: unknown; mode: string }) => unknown;
    html: {
      deserialize: (options: { element: string }) => unknown;
    };
  };
  getMarks: () => Record<string, boolean> | null;
}

// ---------------------------------------------------------------------------
// Custom Elements
// ---------------------------------------------------------------------------

const MediaEmbedElement = ({ attributes, children, element }: MediaEmbedElementProps) => {
  return (
    <div {...attributes} className="relative my-6">
      <div contentEditable={false} className="relative">
        <div className="relative aspect-video w-full overflow-hidden bg-black border border-gray">
          <iframe
            src={element.url}
            title="embed"
            className="absolute inset-0 h-full w-full pointer-events-none"
            allowFullScreen
          />
        </div>
        <div className="absolute inset-0 z-10 cursor-pointer" />
      </div>
      {children}
    </div>
  );
};


const ImageElement = ({ attributes, children, element }: ImageElementProps) => {
  return (
    <div {...attributes} className="relative my-6">
      <div contentEditable={false} className="relative flex justify-center">
        <img
          src={element.url}
          alt="User uploaded"
          className="max-w-full rounded-md border border-gray"
        />
        <div className="absolute inset-0 z-10 cursor-pointer" />
      </div>
      {children}
    </div>
  );
};

const LinkElement = ({ attributes, children, element }: LinkElementProps) => {
  return (
    <a
      {...attributes}
      href={element.url}
      className="text-blue-600 underline cursor-pointer hover:text-blue-800"
      onClick={(e) => {
        e.preventDefault();
        if (element.url) {
          window.open(element.url, "_blank", "noopener,noreferrer");
        }
      }}
    >
      {children}
    </a>
  );
};

// ---------------------------------------------------------------------------
// HTML Serializer
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function serializeLeaf(node: SlateText): string {
  let text = escapeHtml(node.text);
  if (!text) return "";
  if (node.bold) text = `<strong>${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;
  return text;
}

function serializeChildren(children: (SlateElement | SlateText)[]): string {
  return children.map((child) => serializeNode(child)).join("");
}

function serializeNode(node: SlateElement | SlateText): string {
  if ("text" in node) return serializeLeaf(node as SlateText);

  const el = node as SlateElement;
  const inner = serializeChildren(el.children);

  if (el.listStyleType) {
    const tag = el.listStyleType === "disc" ? "ul" : "ol";
    return `<${tag}><li>${inner}</li></${tag}>`;
  }

  switch (el.type) {
    case "media_embed":
      return `<div style="margin:1.5rem 0;"><iframe src="${escapeHtml(
        el.url ?? ""
      )}" style="width:100%;aspect-ratio:16/9;border-radius:8px;border:none;" allowfullscreen></iframe></div>`;
    case "img":
    case "image":
      return `<div style="margin:1.5rem 0;text-align:center;"><img src="${escapeHtml(
        el.url ?? ""
      )}" style="max-width:100%;border-radius:8px;" /></div>`;
    case "h1":
      return `<h1>${inner}</h1>`;
    case "h2":
      return `<h2>${inner}</h2>`;
    case "h3":
      return `<h3>${inner}</h3>`;
    case "blockquote":
      return `<blockquote>${inner}</blockquote>`;
    case "a":
      return `<a href="${escapeHtml(el.url ?? "")}">${inner}</a>`;
    default:
      return `<p>${inner}</p>`;
  }
}

function mergeAdjacentLists(html: string): string {
  return html.replace(/<\/ul>\s*<ul>/g, "").replace(/<\/ol>\s*<ol>/g, "");
}

export function serializeToHtml(nodes: Descendant[]): string {
  const raw = nodes.map((n) => serializeNode(n as SlateElement | SlateText)).join("");
  return mergeAdjacentLists(raw);
}

// ---------------------------------------------------------------------------
// Toolbar Button
// ---------------------------------------------------------------------------

function ToolbarBtn({
  icon,
  active,
  onMouseDown,
  title,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors
      ${
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
    </button>
  );
}

function Separator() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function EditorToolbar({ editor }: { editor: EditorInstance }) {
  const toggleMark = useCallback((e: React.MouseEvent, mark: string) => {
    e.preventDefault();
    editor.tf.toggleMark(mark);
  }, [editor]);

  const toggleBlock = useCallback((e: React.MouseEvent, toggle: () => void) => {
    e.preventDefault();
    toggle();
  }, []);

  const isMarkActive = (mark: string) => {
    const marks = editor.getMarks();
    return marks ? !!marks[mark] : false;
  };

  const isBlockActive = (type: string) => {
    try {
      return !!editor.api.node({ match: { type }, mode: "highest" });
    } catch {
      return false;
    }
  };

  const isListActive = (type: string) => {
    try {
      return !!editor.api.node({
        match: (n: SlateElement) => n.listStyleType === type,
        mode: "highest",
      });
    } catch {
      return false;
    }
  };

const handleLink = useCallback(
  (e: React.MouseEvent) => {
    e.preventDefault();

    const url = window.prompt("URL:");
    if (!url) return;

    editor.tf.insertNodes([
      {
        type: "a",
        url,
        children: [{ text: url }],
      },
      { type: "p", children: [{ text: "" }] },
    ]);

    editor.tf.focus();
  },
  [editor]
);

  const handleEmbed = useCallback(() => {
    const input = window.prompt("YouTube URL:");
    if (!input) return;

    let finalUrl = "";

    if (input.includes("<iframe")) {
      const match = input.match(/src="([^"]+)"/);
      if (match) finalUrl = match[1];
    } else if (input.includes("v=")) {
      const id = input.split("v=")[1].split("&")[0];
      finalUrl = `https://www.youtube.com/embed/${id}`;
    } else if (input.includes("youtu.be/")) {
      const id = input.split("youtu.be/")[1].split("?")[0];
      finalUrl = `https://www.youtube.com/embed/${id}`;
    } else if (input.startsWith("http")) {
      finalUrl = input;
    }

    if (finalUrl) {
      editor.tf.insertNodes([
        { type: "media_embed", url: finalUrl, children: [{ text: "" }] },
        { type: "p", children: [{ text: "" }] },
      ]);
    }
  }, [editor]);

  const handleImage = useCallback(() => {
    const url = window.prompt("Image URL:");
    if (!url) return;

    editor.tf.insertNodes([
      { type: "img", url, children: [{ text: "" }] },
      { type: "p", children: [{ text: "" }] },
    ]);
  }, [editor]);

  const iconSize = 16;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1">
      <ToolbarBtn icon={<Heading1 size={iconSize} />} active={isBlockActive("h1")} onMouseDown={(e) => toggleBlock(e, () => editor.tf.h1.toggle())} title="H1" />
      <ToolbarBtn icon={<Heading2 size={iconSize} />} active={isBlockActive("h2")} onMouseDown={(e) => toggleBlock(e, () => editor.tf.h2.toggle())} title="H2" />
      <ToolbarBtn icon={<Heading3 size={iconSize} />} active={isBlockActive("h3")} onMouseDown={(e) => toggleBlock(e, () => editor.tf.h3.toggle())} title="H3" />

      <Separator />

      <ToolbarBtn icon={<Bold size={iconSize} />} active={isMarkActive("bold")} onMouseDown={(e) => toggleMark(e, "bold")} title="Bold" />
      <ToolbarBtn icon={<Italic size={iconSize} />} active={isMarkActive("italic")} onMouseDown={(e) => toggleMark(e, "italic")} title="Italic" />
      <ToolbarBtn icon={<Underline size={iconSize} />} active={isMarkActive("underline")} onMouseDown={(e) => toggleMark(e, "underline")} title="Underline" />

      <Separator />

      <ToolbarBtn icon={<List size={iconSize} />} active={isListActive("disc")} onMouseDown={(e) => toggleBlock(e, () => toggleList(editor as never, { listStyleType: "disc" }))} title="List" />
      <ToolbarBtn icon={<ListOrdered size={iconSize} />} active={isListActive("decimal")} onMouseDown={(e) => toggleBlock(e, () => toggleList(editor as never, { listStyleType: "decimal" }))} title="Numbered list" />

      <Separator />

      <ToolbarBtn icon={<Quote size={iconSize} />} active={isBlockActive("blockquote")} onMouseDown={(e) => toggleBlock(e, () => editor.tf.blockquote.toggle())} title="Quote" />

      <ToolbarBtn icon={<Link size={iconSize} />} title="Link" onMouseDown={handleLink} />

    <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      title="Media"
    >
      <ImagePlus size={iconSize} />
    </button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="start">
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        handleImage();
      }}
    >
      <ImageIcon size={iconSize} />
      Image
    </DropdownMenuItem>

    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        handleEmbed();
      }}
    >
      <Video size={iconSize} />
      Video
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const PlateEditor = ({
  value,
  onChange,
  label,
  height = 400,
  maxHeight = 600,
}: PlateEditorProps) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipRef = useRef(false);
  const lastValueRef = useRef(value);

  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      H1Plugin,
      H2Plugin,
      H3Plugin,
      BlockquotePlugin,
      TrailingBlockPlugin,
      IndentPlugin.configure({
        inject: { targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote] },
      }),
      ListPlugin.configure({
        inject: { targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote] },
      }),
      LinkPlugin.configure({
        render: { node: LinkElement },
      }),
      MediaEmbedPlugin.configure({
        render: { node: MediaEmbedElement },
      }).extend(() => ({ isVoid: true }) as never),
      ImagePlugin.configure({
        render: { node: ImageElement },
      }).extend(() => ({ isVoid: true }) as never),
    ],
  }) as unknown as EditorInstance;

  const setFromHtml = useCallback(
    (html: string) => {
      skipRef.current = true;
      try {
        const deserialized = editor.api.html.deserialize({ element: html });
        editor.tf.setValue(deserialized as Value);
      } catch {
        editor.tf.setValue([{ type: "p", children: [{ text: html }] }] as Value);
      }
      setTimeout(() => (skipRef.current = false), 0);
    },
    [editor]
  );

  useEffect(() => {
    if (value) setFromHtml(value);
  }, []);

  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      if (value) setFromHtml(value);
    }
  }, [value, setFromHtml]);

  const handleChange = useCallback(
    ({ value: v }: { value: Value }) => {
      if (skipRef.current) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const html = serializeToHtml(v as Descendant[]);
        lastValueRef.current = html;
        onChange(html);
      }, 300);
    },
    [onChange]
  );

  return (
    <div className="mb-4">
      {label && <Label className="mb-2 block">{label}</Label>}

      <div className="rounded-md border border-input ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <Plate editor={editor as never} onChange={handleChange}>
          <EditorToolbar editor={editor} />
          <PlateContent
            placeholder="Write here..."
            className="plate-editor-content px-3 py-2 text-sm focus-visible:outline-none overflow-y-auto"
            style={{ minHeight: height, maxHeight }}
          />
        </Plate>
      </div>
    </div>
  );
};

export default PlateEditor;