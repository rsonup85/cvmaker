import React, { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, Undo2, Redo2 } from "lucide-react";

const ALLOWED = new Set(["B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "BR", "DIV", "P", "SPAN"]);

export function sanitizeRichHtml(html = "") {
  if (!html) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return String(html);
  try {
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.COMMENT_NODE) {
          child.remove();
          return;
        }
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!ALLOWED.has(child.tagName)) {
            const frag = document.createDocumentFragment();
            while (child.firstChild) frag.appendChild(child.firstChild);
            child.replaceWith(frag);
            return;
          }
          [...child.attributes].forEach((a) => {
            if (child.tagName === "SPAN" && a.name === "style") {
              const s = String(a.value || "").toLowerCase();
              const keep = [];
              if (s.includes("font-weight") && (s.includes("bold") || /[67]00/.test(s))) keep.push("font-weight:bold");
              if (s.includes("font-style") && s.includes("italic")) keep.push("font-style:italic");
              if (s.includes("underline")) keep.push("text-decoration:underline");
              if (keep.length) child.setAttribute("style", keep.join(";"));
              else child.removeAttribute("style");
            } else {
              child.removeAttribute(a.name);
            }
          });
          walk(child);
        }
      });
    };
    walk(doc.body);
    return doc.body.innerHTML;
  } catch (_) {
    return String(html);
  }
}

function toEditorHtml(value = "") {
  const str = String(value ?? "");
  if (!str) return "";
  if (/<[a-z][\s\S]*>/i.test(str) || /&(?:nbsp|amp|lt|gt|quot|#\d+|#x[0-9a-f]+);/i.test(str)) {
    return sanitizeRichHtml(str);
  }
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

export function richTextToHtml(value = "") {
  return toEditorHtml(value);
}

export function RichText({ value, className = "" }) {
  const html = toEditorHtml(value);
  if (!html) return null;
  return <div className={`rich-text-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function RichTextEditor({ label, value, onChange, rows = 7, placeholder }) {
  const editorRef = useRef(null);
  const historyRef = useRef([]);
  const futureRef = useRef([]);
  const lastSentRef = useRef(value || "");
  const savedRangeRef = useRef(null);
  const focusedRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Only push external value into the editor when NOT focused.
  // This prevents React re-renders from eating spaces / backspace / digits.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (focusedRef.current) return;
    const incoming = value || "";
    if (incoming === lastSentRef.current && el.innerHTML) return;
    const next = toEditorHtml(incoming);
    if (el.innerHTML !== next) {
      el.innerHTML = next;
    }
    lastSentRef.current = incoming;
  }, [value]);

  // Initial mount content
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (!el.innerHTML && value) {
      el.innerHTML = toEditorHtml(value);
      lastSentRef.current = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncButtons = () => {
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  };

  const readHtml = () => sanitizeRichHtml(editorRef.current?.innerHTML || "");

  const emit = (html) => {
    if (html === lastSentRef.current) return;
    historyRef.current.push(lastSentRef.current);
    if (historyRef.current.length > 40) historyRef.current.shift();
    futureRef.current = [];
    lastSentRef.current = html;
    onChange(html);
    syncButtons();
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
    focusedRef.current = true;
    restoreSelection();
    try {
      document.execCommand(cmd, false, arg);
    } catch (_) {}
    saveSelection();
    emit(readHtml());
  };

  const undo = () => {
    const previous = historyRef.current.pop();
    if (previous == null) return;
    futureRef.current.push(lastSentRef.current);
    lastSentRef.current = previous;
    if (editorRef.current) editorRef.current.innerHTML = toEditorHtml(previous);
    onChange(previous);
    syncButtons();
  };

  const redo = () => {
    const next = futureRef.current.pop();
    if (next == null) return;
    historyRef.current.push(lastSentRef.current);
    lastSentRef.current = next;
    if (editorRef.current) editorRef.current.innerHTML = toEditorHtml(next);
    onChange(next);
    syncButtons();
  };

  const handleFocus = () => {
    focusedRef.current = true;
  };

  const handleBlur = () => {
    focusedRef.current = false;
    emit(readHtml());
  };

  // Debounced live update so parent/preview stays in sync without rewriting DOM
  const debounceRef = useRef(null);
  const handleInput = () => {
    focusedRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const html = readHtml();
      // Update parent without marking as "external" rewrite target while focused
      if (html !== lastSentRef.current) {
        lastSentRef.current = html;
        onChange(html);
      }
    }, 120);
  };

  const handleKeyDown = (e) => {
    // Never block space, backspace, digits, enter
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
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
        onFocus={handleFocus}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        role="textbox"
        aria-multiline="true"
      />
      <div className="rich-editor-toolbar" role="toolbar" aria-label="Text formatting">
        {toolbar.map(([cmd, icon, title]) => (
          <button
            key={cmd}
            type="button"
            title={title}
            aria-label={title}
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => command(cmd)}
          >
            {icon}
          </button>
        ))}
        <span className="rich-editor-divider" />
        <button type="button" title="Undo" aria-label="Undo" disabled={!canUndo} onClick={undo}>
          <Undo2 size={19} />
        </button>
        <button type="button" title="Redo" aria-label="Redo" disabled={!canRedo} onClick={redo}>
          <Redo2 size={19} />
        </button>
      </div>
      <div className="mt-1 text-[10px] text-slate-400">Text select karke B / I / U ya list button use karein.</div>
    </div>
  );
}
