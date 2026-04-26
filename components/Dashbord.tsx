import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Block = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
};

type OutputFormat = "md" | "json" | "xml";

// ── Template blocks (the prompt recipe) ─────────────────────────────────────

const DEFAULT_BLOCKS: Block[] = [
  { id: "context",     label: "Context",      placeholder: "Who are you? What's the situation?",         value: "" },
  { id: "goal",        label: "Goal",         placeholder: "What do you want the AI to do?",             value: "" },
  { id: "constraints", label: "Constraints",  placeholder: "Rules, tone, length, format limits...",      value: "" },
  { id: "output",      label: "Output Format",placeholder: "How should the response look?",              value: "" },
  { id: "examples",    label: "Examples",     placeholder: "Few-shot examples if any...",                value: "" },
  { id: "avoid",       label: "Avoid",        placeholder: "What should it NOT do?",                     value: "" },
];

// ── Output assembler ─────────────────────────────────────────────────────────

function buildOutput(blocks: Block[], format: OutputFormat): string {
  const filled = blocks.filter((b) => b.value.trim());

  if (format === "md") {
    return filled.map((b) => `## ${b.label}\n${b.value.trim()}`).join("\n\n");
  }

  if (format === "json") {
    const obj = Object.fromEntries(filled.map((b) => [b.id, b.value.trim()]));
    return JSON.stringify(obj, null, 2);
  }

  if (format === "xml") {
    const inner = filled
      .map((b) => `  <${b.id}>${b.value.trim()}</${b.id}>`)
      .join("\n");
    return `<prompt>\n${inner}\n</prompt>`;
  }

  return "";
}

// ── Components ───────────────────────────────────────────────────────────────

function Scratchpad({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <section className="panel">
      <h2 className="panel-title">Scratchpad</h2>
      <textarea
        className="textarea"
        placeholder="Brain dump here. Messy is fine."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </section>
  );
}

function Template({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (id: string, value: string) => void;
}) {
  return (
    <section className="panel">
      <h2 className="panel-title">Template</h2>
      <div className="blocks">
        {blocks.map((b) => (
          <div key={b.id} className="block">
            <label className="block-label">{b.label}</label>
            <textarea
              className="textarea block-textarea"
              placeholder={b.placeholder}
              value={b.value}
              onChange={(e) => onChange(b.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Output({
  blocks,
  format,
  onFormatChange,
}: {
  blocks: Block[];
  format: OutputFormat;
  onFormatChange: (f: OutputFormat) => void;
}) {
  const output = buildOutput(blocks, format);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="panel">
      <div className="output-header">
        <h2 className="panel-title">Output</h2>
        <div className="format-tabs">
          {(["md", "json", "xml"] as OutputFormat[]).map((f) => (
            <button
              key={f}
              className={`tab ${format === f ? "tab-active" : ""}`}
              onClick={() => onFormatChange(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <pre className="output-pre">{output || "Fill in the template blocks to see your prompt here."}</pre>
      <button className="copy-btn" onClick={copy} disabled={!output}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </section>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function DashApp() {
  const [scratchpad, setScratchpad] = useState("");
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
  const [format, setFormat] = useState<OutputFormat>("md");

  const updateBlock = (id: string, value: string) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, value } : b)));

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <header className="topbar">
          <span className="logo">promptground</span>
          <span className="tagline">structure your thinking, sharpen your prompts</span>
        </header>
        <main className="grid">
          <Scratchpad value={scratchpad} onChange={setScratchpad} />
          <Template blocks={blocks} onChange={updateBlock} />
          <Output blocks={blocks} format={format} onFormatChange={setFormat} />
        </main>
      </div>
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0e0e0e;
    --surface: #161616;
    --border: #2a2a2a;
    --text: #e8e8e8;
    --muted: #555;
    --accent: #c8f135;
    --font-ui: 'Syne', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-ui); }

  .app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  .topbar {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 14px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
  }

  .logo {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--accent);
  }

  .tagline {
    font-size: 11px;
    color: var(--muted);
    font-family: var(--font-mono);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    flex: 1;
    overflow: hidden;
    gap: 0;
  }

  .panel {
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
    overflow: hidden;
    padding: 20px;
    gap: 12px;
  }

  .panel:last-child { border-right: none; }

  .panel-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .textarea {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.6;
    padding: 12px;
    resize: none;
    outline: none;
    transition: border-color 0.15s;
  }

  .textarea:focus { border-color: var(--accent); }
  .textarea::placeholder { color: var(--muted); }

  .blocks { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1; }

  .block { display: flex; flex-direction: column; gap: 4px; }

  .block-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .block-textarea { flex: none; height: 64px; }

  .output-header { display: flex; align-items: center; justify-content: space-between; }

  .format-tabs { display: flex; gap: 4px; }

  .tab {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .tab:hover { color: var(--text); border-color: var(--text); }

  .tab-active {
    background: var(--accent);
    border-color: var(--accent);
    color: #000;
    font-weight: 500;
  }

  .output-pre {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.6;
    color: var(--text);
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .copy-btn {
    background: var(--accent);
    border: none;
    border-radius: 6px;
    color: #000;
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 600;
    padding: 8px 0;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .copy-btn:hover { opacity: 0.85; }
  .copy-btn:disabled { opacity: 0.3; cursor: not-allowed; }
`;