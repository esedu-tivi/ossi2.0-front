import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { serializeToHtml } from '../plate-editor-html';

// Mock platejs/react — jsdom does not support contenteditable
vi.mock('platejs/react', async () => {
  const React = await import('react');
  return {
    Plate: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'plate-root' }, children),
    PlateContent: ({ placeholder, style, className }: Record<string, unknown>) =>
      React.createElement('div', {
        'data-testid': 'plate-content',
        'data-placeholder': placeholder,
        style,
        className,
        role: 'textbox',
      }),
    usePlateEditor: () => ({
      tf: {
        toggleMark: vi.fn(),
        setValue: vi.fn(),
        h1: { toggle: vi.fn() },
        h2: { toggle: vi.fn() },
        h3: { toggle: vi.fn() },
        blockquote: { toggle: vi.fn() },
        listStyleType: { toggle: vi.fn() },
        insertLink: vi.fn(),
      },
      api: {
        node: vi.fn(),
        html: { deserialize: vi.fn(() => []) },
      },
      getMarks: () => ({}),
    }),
    KEYS: {
      heading: ['h1', 'h2', 'h3'],
      p: 'p',
      blockquote: 'blockquote',
    },
  };
});

vi.mock('@platejs/basic-nodes/react', () => ({
  BoldPlugin: {},
  ItalicPlugin: {},
  UnderlinePlugin: {},
  BlockquotePlugin: {},
  H1Plugin: { withComponent: vi.fn().mockReturnThis(), configure: vi.fn().mockReturnThis() },
  H2Plugin: { withComponent: vi.fn().mockReturnThis(), configure: vi.fn().mockReturnThis() },
  H3Plugin: { withComponent: vi.fn().mockReturnThis(), configure: vi.fn().mockReturnThis() },
}));

vi.mock('@platejs/indent/react', () => ({
  IndentPlugin: { configure: vi.fn().mockReturnValue({}) },
}));

vi.mock('@platejs/list/react', () => ({
  ListPlugin: { configure: vi.fn().mockReturnValue({}) },
}));

vi.mock('@platejs/link/react', () => ({
  LinkPlugin: {},
}));

// ---------------------------------------------------------------------------
// Component rendering tests
// ---------------------------------------------------------------------------

describe('PlateEditor (component)', () => {
  // Dynamic import so mocks are established first
  let PlateEditor: typeof import('../plate-editor').default;

  beforeAll(async () => {
    const mod = await import('../plate-editor');
    PlateEditor = mod.default;
  });

  it('renders with label', () => {
    render(<PlateEditor value="" onChange={vi.fn()} label="Kuvaus" />);
    expect(screen.getByText('Kuvaus')).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    const { container } = render(<PlateEditor value="" onChange={vi.fn()} />);
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('renders toolbar buttons', () => {
    render(<PlateEditor value="" onChange={vi.fn()} />);
    // Check for key toolbar buttons by title attribute
    expect(screen.getByTitle('Lihavointi (⌘B)')).toBeInTheDocument();
    expect(screen.getByTitle('Kursiivi (⌘I)')).toBeInTheDocument();
    expect(screen.getByTitle('Alleviivaus (⌘U)')).toBeInTheDocument();
    expect(screen.getByTitle('Otsikko 1')).toBeInTheDocument();
    expect(screen.getByTitle('Luettelo')).toBeInTheDocument();
    expect(screen.getByTitle('Lainaus')).toBeInTheDocument();
    expect(screen.getByTitle('Linkki')).toBeInTheDocument();
  });

  it('applies custom height to editor content area', () => {
    render(<PlateEditor value="" onChange={vi.fn()} height={600} />);
    const content = screen.getByTestId('plate-content');
    expect(content).toHaveStyle({ minHeight: '600px' });
  });

  it('applies default height when not specified', () => {
    render(<PlateEditor value="" onChange={vi.fn()} />);
    const content = screen.getByTestId('plate-content');
    expect(content).toHaveStyle({ minHeight: '400px' });
  });
});

// ---------------------------------------------------------------------------
// Serializer unit tests (pure function, no React needed)
// ---------------------------------------------------------------------------

describe('serializeToHtml', () => {
  it('serializes a plain paragraph', () => {
    const nodes = [{ type: 'p', children: [{ text: 'Hello world' }] }];
    expect(serializeToHtml(nodes)).toBe('<p>Hello world</p>');
  });

  it('serializes bold, italic, underline marks', () => {
    const nodes = [
      {
        type: 'p',
        children: [
          { text: 'normal ' },
          { text: 'bold', bold: true },
          { text: ' ' },
          { text: 'italic', italic: true },
          { text: ' ' },
          { text: 'underline', underline: true },
        ],
      },
    ];
    expect(serializeToHtml(nodes)).toBe(
      '<p>normal <strong>bold</strong> <em>italic</em> <u>underline</u></p>',
    );
  });

  it('serializes nested marks (bold + italic)', () => {
    const nodes = [
      {
        type: 'p',
        children: [{ text: 'both', bold: true, italic: true }],
      },
    ];
    expect(serializeToHtml(nodes)).toBe('<p><em><strong>both</strong></em></p>');
  });

  it('serializes headings', () => {
    expect(serializeToHtml([{ type: 'h1', children: [{ text: 'Title' }] }])).toBe(
      '<h1>Title</h1>',
    );
    expect(serializeToHtml([{ type: 'h2', children: [{ text: 'Sub' }] }])).toBe(
      '<h2>Sub</h2>',
    );
    expect(serializeToHtml([{ type: 'h3', children: [{ text: 'Small' }] }])).toBe(
      '<h3>Small</h3>',
    );
  });

  it('serializes blockquotes', () => {
    const nodes = [{ type: 'blockquote', children: [{ text: 'Quote text' }] }];
    expect(serializeToHtml(nodes)).toBe('<blockquote>Quote text</blockquote>');
  });

  it('serializes links', () => {
    const nodes = [
      {
        type: 'p',
        children: [
          { text: 'Click ' },
          { type: 'a', url: 'https://example.com', children: [{ text: 'here' }] },
        ],
      },
    ];
    expect(serializeToHtml(nodes)).toBe(
      '<p>Click <a href="https://example.com">here</a></p>',
    );
  });

  it('serializes indent-based bulleted list items and merges adjacent', () => {
    const nodes = [
      { type: 'p', listStyleType: 'disc', indent: 1, children: [{ text: 'Item A' }] },
      { type: 'p', listStyleType: 'disc', indent: 1, children: [{ text: 'Item B' }] },
    ];
    expect(serializeToHtml(nodes)).toBe(
      '<ul><li>Item A</li><li>Item B</li></ul>',
    );
  });

  it('serializes indent-based numbered list items and merges adjacent', () => {
    const nodes = [
      { type: 'p', listStyleType: 'decimal', indent: 1, children: [{ text: 'First' }] },
      { type: 'p', listStyleType: 'decimal', indent: 1, children: [{ text: 'Second' }] },
    ];
    expect(serializeToHtml(nodes)).toBe(
      '<ol><li>First</li><li>Second</li></ol>',
    );
  });

  it('escapes HTML entities in text', () => {
    const nodes = [{ type: 'p', children: [{ text: '<script>alert("xss")</script>' }] }];
    expect(serializeToHtml(nodes)).toBe(
      '<p>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</p>',
    );
  });

  it('returns empty paragraph for empty text', () => {
    const nodes = [{ type: 'p', children: [{ text: '' }] }];
    expect(serializeToHtml(nodes)).toBe('<p></p>');
  });
});
