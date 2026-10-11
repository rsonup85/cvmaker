import React, { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, Undo2, Redo2 } from "lucide-react";

const ALLOWED = new Set(["B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "BR", "DIV", "P"]);

export function sanitizeRichHtml(html = "") {
  if (!html) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  const clean = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) { child.remove(); return; }
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!ALLOWED.has(child.tagName)) {
          const frag = document.createDocumentFragment();
          while (child.firstChild) frag.appendChild(child.firstChild);
          child.replaceWith(frag);
          return;
        }
        [...child.attributes].forEach((a) => child.removeAttribute(a.name));
        clean(child);
      }
    });
  };
  clean(doc.body);
  return doc.body.innerHTML;
}

export function richTextToHtml(value = "") {
  const str = String(value ?? "");
  if (/<\/?(b|strong|i|em|u|ul|ol|li|br|p|div)\b/i.test(str)) return sanitizeRichHtml(str);
  return str
    .split(/\n{2,}/)
    .map((block) => `<p>${block.split("\n").map((line) => line.replace(/^\s*[•\-]\s+/, "• ")).join("<br>")}</p>`)
    .join("");
}

export function RichText({ value, className = "" }) {
  const html = richTextToHtml(value);
  if (!html) return null;
  return <div className={`rich-text-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

function plainToHtml(value = "") {
  const str = String(value ?? "");
  if (/<[a-z][\s\S]*>/i.test(str)) return sanitizeRichHtml(str);
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

export function RichTextEditor({ label, value, onChange, rows = 7, placeholder }) {
  const editorRef = useRef(null);
  const historyRef = useRef([]);
  const futureRef = useRef([]);
  const lastValueRef = useRef(value || "");
  const savedRangeRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = plainToHtml(value || "");
    if (el.innerHTML !== next) el.innerHTML = next;
    lastValueRef.current = value || "";
  }, [value]);

  const syncButtons = () => {
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  };

  const commit = () => {
    const html = sanitizeRichHtml(editorRef.current?.innerHTML || "");
    if (html !== lastValueRef.current) {
      historyRef.current.push(lastValueRef.current);
      if (historyRef.current.length > 30) historyRef.current.shift();
      futureRef.current = [];
      lastValueRef.current = html;
      onChange(html);
      syncButtons();
    }
  };

  const saveSelection = () => {
    const el = editorRef.current;
    const sel = window.getSelection?.();
    if (!el || !sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (el.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection?.();
    if (!sel) return;
    try {
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (_) {}
  };

  const command = (cmd, arg = null) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    restoreSelection();
    document.execCommand(cmd, false, arg);
    saveSelection();
    commit();
  };

  const undo = () => {
    const previous = historyRef.current.pop();
    if (previous == null) return;
    futureRef.current.push(lastValueRef.current);
    lastValueRef.current = previous;
    if (editorRef.current) editorRef.current.innerHTML = plainToHtml(previous);
    onChange(previous);
    syncButtons();
  };

  const redo = () => {
    const next = futureRef.current.pop();
    if (next == null) return;
    historyRef.current.push(lastValueRef.current);
    lastValueRef.current = next;
    if (editorRef.current) editorRef.current.innerHTML = plainToHtml(next);
    onChange(next);
    syncButtons();
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault(); redo();
    }
  };

  const toolbar = [
    ["bold", <Bold size={18} strokeWidth={2.8} />, "Bold"],
    ["italic", <Italic size={18} />, "Italic"],
    ["underline", <Underline size={18} />, "Underline"],
    ["insertUnorderedList", <List size={20} />, "Bullet list"],
  ];

  return (
    <div className="rich-editor">
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>}
      <div
        ref={editorRef}
        className="rich-editor-input"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || "Write here..."}
        style={{ minHeight: `${Math.max(120, rows * 24)}px` }}
        onInput={commit}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        role="textbox"
        aria-multiline="true"
      />
      <div className="rich-editor-toolbar" role="toolbar" aria-label="Text formatting">
        {toolbar.map(([cmd, icon, title]) => (
          <button key={cmd} type="button" title={title} aria-label={title}
            onPointerDown={(e) => { e.preventDefault(); saveSelection(); }}
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
            onClick={() => command(cmd)}>
            {icon}
          </button>
        ))}
        <span className="rich-editor-divider" />
        <button type="button" title="Undo" aria-label="Undo" disabled={!canUndo} onClick={undo}><Undo2 size={19} /></button>
        <button type="button" title="Redo" aria-label="Redo" disabled={!canRedo} onClick={redo}><Redo2 size={19} /></button>
      </div>
      <div className="mt-1 text-[10px] text-slate-400">Text select karke B / I / U ya list button use karein.</div>
    </div>
  );
}
