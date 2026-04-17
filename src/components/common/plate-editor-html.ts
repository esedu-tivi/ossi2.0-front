import type { Descendant } from "platejs"

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
  if ('text' in node) return serializeLeaf(node as SlateText);

  const el = node as SlateElement;
  const inner = serializeChildren(el.children);

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

function mergeAdjacentLists(html: string): string {
  return html
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/<\/ol>\s*<ol>/g, '');
}

export function serializeToHtml(nodes: Descendant[]): string {
  const raw = nodes.map((n) => serializeNode(n as SlateElement | SlateText)).join('');
  return mergeAdjacentLists(raw);
}
