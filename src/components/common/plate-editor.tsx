import { useCallback, useEffect, useRef } from 'react';
import type { Descendant, Value } from 'platejs';
import { KEYS } from 'platejs';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
} from '@platejs/basic-nodes/react';
import { IndentPlugin } from '@platejs/indent/react';
import { ListPlugin } from '@platejs/list/react';
import { LinkPlugin } from '@platejs/link/react';
import { Plate, PlateContent, usePlateEditor } from 'platejs/react';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlateEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  height?: number;
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

// ---------------------------------------------------------------------------
// HTML Serializer (pure function — easy to test)
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function serializeLeaf(node: SlateText): string {
  let text = escapeHtml(node.text);
  if (!text) return '';
  if (node.bold) text = `<strong>${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;
  return text;
}

function serializeChildren(children: (SlateElement | SlateText)[]): string {
  return children.map((child) => serializeNode(child)).join('');
}

function serializeNode(node: SlateElement | SlateText): string {
  // Leaf text node
  if ('text' in node) return serializeLeaf(node as SlateText);

  const el = node as SlateElement;
  const inner = serializeChildren(el.children);

  // Indent-based lists (Plate's ListPlugin uses indent + listStyleType)
  if (el.listStyleType) {
    const tag = el.listStyleType === 'disc' ? 'ul' : 'ol';
    return `<${tag}><li>${inner}</li></${tag}>`;
  }

  switch (el.type) {
    case 'h1':
      return `<h1>${inner}</h1>`;
    case 'h2':
      return `<h2>${inner}</h2>`;
    case 'h3':
      return `<h3>${inner}</h3>`;
    case 'blockquote':
      return `<blockquote>${inner}</blockquote>`;
    case 'a':
      return `<a href="${escapeHtml(el.url ?? '')}">${inner}</a>`;
    case 'p':
    default:
      return `<p>${inner}</p>`;
  }
}

/**
 * Merge adjacent same-type list wrappers produced by serializeNode.
 * e.g. `<ul><li>A</li></ul><ul><li>B</li></ul>` → `<ul><li>A</li><li>B</li></ul>`
 */
function mergeAdjacentLists(html: string): string {
  return html
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/<\/ol>\s*<ol>/g, '');
}

export function serializeToHtml(nodes: Descendant[]): string {
  const raw = nodes.map((n) => serializeNode(n as SlateElement | SlateText)).join('');
  return mergeAdjacentLists(raw);
}

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------

interface ToolbarBtnProps {
  icon: React.ReactNode;
  active?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  title: string;
}

function ToolbarBtn({ icon, active, onMouseDown, title }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors
        ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditorToolbar({ editor }: { editor: any }) {
  // Mark toggle helper
  const toggleMark = useCallback(
    (e: React.MouseEvent, mark: string) => {
      e.preventDefault();
      editor.tf.toggleMark(mark);
    },
    [editor],
  );

  // Block toggle helper
  const toggleBlock = useCallback(
    (e: React.MouseEvent, toggle: () => void) => {
      e.preventDefault();
      toggle();
    },
    [],
  );

  // Check if a mark is active
  const isMarkActive = (mark: string) => {
    const marks = editor.getMarks();
    return marks ? !!(marks as Record<string, unknown>)[mark] : false;
  };

  // Check if a block type is active
  const isBlockActive = (type: string) => {
    try {
      const entry = editor.api.node({
        match: { type },
        mode: 'highest',
      });
      return !!entry;
    } catch {
      return false;
    }
  };

  // Check if list style is active
  const isListActive = (listStyle: string) => {
    try {
      const entry = editor.api.node({
        match: (n: SlateElement) => n.listStyleType === listStyle,
        mode: 'highest',
      });
      return !!entry;
    } catch {
      return false;
    }
  };

  const handleLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const url = window.prompt('Linkki URL:');
      if (url) {
        editor.tf.insertLink({ url });
      }
    },
    [editor],
  );

  const iconSize = 16;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1">
      {/* Headings */}
      <ToolbarBtn
        icon={<Heading1 size={iconSize} />}
        active={isBlockActive('h1')}
        onMouseDown={(e) => toggleBlock(e, () => editor.tf.h1.toggle())}
        title="Otsikko 1"
      />
      <ToolbarBtn
        icon={<Heading2 size={iconSize} />}
        active={isBlockActive('h2')}
        onMouseDown={(e) => toggleBlock(e, () => editor.tf.h2.toggle())}
        title="Otsikko 2"
      />
      <ToolbarBtn
        icon={<Heading3 size={iconSize} />}
        active={isBlockActive('h3')}
        onMouseDown={(e) => toggleBlock(e, () => editor.tf.h3.toggle())}
        title="Otsikko 3"
      />

      <Separator />

      {/* Marks */}
      <ToolbarBtn
        icon={<Bold size={iconSize} />}
        active={isMarkActive('bold')}
        onMouseDown={(e) => toggleMark(e, 'bold')}
        title="Lihavointi (⌘B)"
      />
      <ToolbarBtn
        icon={<Italic size={iconSize} />}
        active={isMarkActive('italic')}
        onMouseDown={(e) => toggleMark(e, 'italic')}
        title="Kursiivi (⌘I)"
      />
      <ToolbarBtn
        icon={<Underline size={iconSize} />}
        active={isMarkActive('underline')}
        onMouseDown={(e) => toggleMark(e, 'underline')}
        title="Alleviivaus (⌘U)"
      />

      <Separator />

      {/* Lists */}
      <ToolbarBtn
        icon={<List size={iconSize} />}
        active={isListActive('disc')}
        onMouseDown={(e) => toggleBlock(e, () => editor.tf.listStyleType.toggle('disc'))}
        title="Luettelo"
      />
      <ToolbarBtn
        icon={<ListOrdered size={iconSize} />}
        active={isListActive('decimal')}
        onMouseDown={(e) => toggleBlock(e, () => editor.tf.listStyleType.toggle('decimal'))}
        title="Numeroitu luettelo"
      />

      <Separator />

      {/* Blockquote */}
      <ToolbarBtn
        icon={<Quote size={iconSize} />}
        active={isBlockActive('blockquote')}
        onMouseDown={(e) => toggleBlock(e, () => editor.tf.blockquote.toggle())}
        title="Lainaus"
      />

      {/* Link */}
      <ToolbarBtn
        icon={<Link size={iconSize} />}
        active={false}
        onMouseDown={handleLink}
        title="Linkki"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const PlateEditor = ({
  value,
  onChange,
  label,
  height = 400,
}: PlateEditorProps) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipOnChangeRef = useRef(false);
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
      IndentPlugin.configure({
        inject: {
          targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote],
        },
      }),
      ListPlugin.configure({
        inject: {
          targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote],
        },
      }),
      LinkPlugin,
    ],
  });

  // Deserialize HTML and set editor value
  const setEditorFromHtml = useCallback(
    (html: string) => {
      skipOnChangeRef.current = true;
      try {
        const deserialized = editor.api.html.deserialize({ element: html });
        editor.tf.setValue(deserialized as Value);
      } catch {
        editor.tf.setValue([{ type: 'p', children: [{ text: html }] }] as Value);
      }
      // Reset skip flag after React processes the update
      setTimeout(() => {
        skipOnChangeRef.current = false;
      }, 0);
    },
    [editor],
  );

  // Set initial value on mount
  useEffect(() => {
    if (value) {
      setEditorFromHtml(value);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update editor when external value changes
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      if (value) {
        setEditorFromHtml(value);
      }
    }
  }, [value, setEditorFromHtml]);

  // Debounced onChange handler
  const handleChange = useCallback(
    ({ value: newValue }: { value: Value }) => {
      if (skipOnChangeRef.current) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const html = serializeToHtml(newValue as Descendant[]);
        lastValueRef.current = html;
        onChange(html);
      }, 300);
    },
    [onChange],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="mb-4">
      {label && <Label className="mb-2 block">{label}</Label>}
      <div className="rounded-md border border-input ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <Plate editor={editor} onChange={handleChange}>
          <EditorToolbar editor={editor} />
          <PlateContent
            placeholder="Kirjoita tahan..."
            className="plate-editor-content min-h-[100px] px-3 py-2 text-sm"
            style={{ minHeight: height }}
          />
        </Plate>
      </div>
    </div>
  );
};

export default PlateEditor;
