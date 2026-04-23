"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";

interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
}

/* ─── Toolbar Button ─── */
function Btn({
    active,
    onClick,
    title,
    children,
}: {
    active?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            style={{
                padding: "6px 10px",
                border: active ? "1.5px solid #d32f2f" : "1px solid var(--color-border, #d1d5db)",
                borderRadius: "6px",
                background: active ? "rgba(211,47,47,0.08)" : "var(--color-surface, #f9fafb)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: active ? "#d32f2f" : "var(--color-text-primary, #111)",
                lineHeight: 1,
                transition: "all 0.15s ease",
            }}
        >
            {children}
        </button>
    );
}

/* ─── Main Editor ─── */
export default function RichEditor({ value, onChange }: RichEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                bulletList: { keepMarks: true },
                orderedList: { keepMarks: true },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
            }),
            Placeholder.configure({
                placeholder: "기사 본문을 입력하세요. 마크다운도 지원됩니다! (예: **굵게**, ## 소제목)",
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                style: [
                    "min-height: 400px",
                    "padding: 20px",
                    "outline: none",
                    "font-size: 15px",
                    "line-height: 1.8",
                    "color: #222",
                    "font-family: inherit",
                ].join(";"),
            },
            // 붙여넣기 시 서식 자동 정리 (검은 배경 문제 해결)
            handlePaste: (view, event) => {
                const text = event.clipboardData?.getData("text/plain");
                if (text) {
                    // HTML이 아닌 plain text로 붙여넣기
                    const { state } = view;
                    const { tr } = state;
                    const textNode = state.schema.text(text);
                    tr.replaceSelectionWith(textNode);
                    view.dispatch(tr);
                    event.preventDefault();
                    return true;
                }
                return false;
            },
        },
        immediatelyRender: false,
    });

    // 외부에서 value가 초기화되면(발행 후 clear) 에디터도 초기화
    useEffect(() => {
        if (editor && value === "" && editor.getHTML() !== "<p></p>") {
            editor.commands.clearContent();
        }
    }, [editor, value]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const url = prompt("링크 URL을 입력하세요:", "https://");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    return (
        <div
            style={{
                border: "1px solid var(--color-border, #d1d5db)",
                borderRadius: "12px",
                overflow: "hidden",
                background: "white",
            }}
        >
            {/* ─── Toolbar ─── */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--color-border, #d1d5db)",
                    background: "var(--color-surface, #f9fafb)",
                }}
            >
                <Btn
                    active={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="굵게 (Ctrl+B)"
                >
                    <b>B</b>
                </Btn>
                <Btn
                    active={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="기울임 (Ctrl+I)"
                >
                    <i>I</i>
                </Btn>
                <Btn
                    active={editor.isActive("underline")}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="밑줄 (Ctrl+U)"
                >
                    <u>U</u>
                </Btn>
                <Btn
                    active={editor.isActive("strike")}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    title="취소선"
                >
                    <s>S</s>
                </Btn>

                <span style={{ width: "1px", background: "var(--color-border, #d1d5db)", margin: "0 6px" }} />

                <Btn
                    active={editor.isActive("heading", { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    title="대제목 (## + Space)"
                >
                    H2
                </Btn>
                <Btn
                    active={editor.isActive("heading", { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    title="소제목 (### + Space)"
                >
                    H3
                </Btn>

                <span style={{ width: "1px", background: "var(--color-border, #d1d5db)", margin: "0 6px" }} />

                <Btn
                    active={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title="목록 (- + Space)"
                >
                    • 목록
                </Btn>
                <Btn
                    active={editor.isActive("orderedList")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    title="번호목록 (1. + Space)"
                >
                    1. 목록
                </Btn>
                <Btn
                    active={editor.isActive("blockquote")}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    title="인용 (> + Space)"
                >
                    ❝ 인용
                </Btn>

                <span style={{ width: "1px", background: "var(--color-border, #d1d5db)", margin: "0 6px" }} />

                <Btn
                    active={editor.isActive("link")}
                    onClick={setLink}
                    title="링크 삽입"
                >
                    🔗 링크
                </Btn>
                <Btn
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    title="서식 전체 제거"
                >
                    ✕ 초기화
                </Btn>
            </div>

            {/* ─── 마크다운 단축키 안내 ─── */}
            <div
                style={{
                    padding: "6px 14px",
                    fontSize: "11px",
                    color: "#999",
                    background: "#fafafa",
                    borderBottom: "1px solid #f0f0f0",
                }}
            >
                💡 팁: <code>## </code>소제목 · <code>**</code>굵게<code>**</code> · <code>- </code>목록 · <code>&gt; </code>인용 — 마크다운이 자동 변환됩니다
            </div>

            {/* ─── Editor Area ─── */}
            <EditorContent editor={editor} />

            {/* ─── TipTap 기본 스타일 ─── */}
            <style>{`
                .tiptap p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                    font-style: italic;
                }
                .tiptap h2 {
                    font-size: 22px;
                    font-weight: 700;
                    margin: 28px 0 12px;
                    color: #111;
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 8px;
                }
                .tiptap h3 {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 20px 0 8px;
                    color: #222;
                }
                .tiptap p {
                    margin: 8px 0;
                }
                .tiptap ul, .tiptap ol {
                    padding-left: 24px;
                    margin: 8px 0;
                }
                .tiptap li {
                    margin: 4px 0;
                }
                .tiptap blockquote {
                    border-left: 4px solid #d32f2f;
                    margin: 16px 0;
                    padding: 12px 20px;
                    background: rgba(211,47,47,0.04);
                    border-radius: 0 8px 8px 0;
                    color: #555;
                    font-style: italic;
                }
                .tiptap a {
                    color: #d32f2f;
                    text-decoration: underline;
                }
                .tiptap:focus {
                    outline: none;
                }
            `}</style>
        </div>
    );
}
