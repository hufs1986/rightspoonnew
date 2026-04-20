"use client";

import { useRef, useCallback } from "react";

interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const toolbarBtnStyle: React.CSSProperties = {
    padding: "6px 10px",
    border: "1px solid var(--color-border, #d1d5db)",
    borderRadius: "4px",
    background: "var(--color-surface, #f9fafb)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--color-text-primary, #111)",
    lineHeight: 1,
};

export default function RichEditor({ value, onChange }: RichEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    const execCommand = useCallback((command: string, val?: string) => {
        document.execCommand(command, false, val);
        // sync content back
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const handleLink = useCallback(() => {
        const url = prompt("링크 URL을 입력하세요:", "https://");
        if (url) {
            execCommand("createLink", url);
        }
    }, [execCommand]);

    return (
        <div style={{ border: "1px solid var(--color-border, #d1d5db)", borderRadius: "8px", overflow: "hidden", background: "white" }}>
            {/* Toolbar */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                padding: "8px",
                borderBottom: "1px solid var(--color-border, #d1d5db)",
                background: "var(--color-surface, #f9fafb)",
            }}>
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("bold")} title="굵게"><b>B</b></button>
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("italic")} title="기울임"><i>I</i></button>
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("underline")} title="밑줄"><u>U</u></button>
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("strikeThrough")} title="취소선"><s>S</s></button>
                <span style={{ width: "1px", background: "var(--color-border, #d1d5db)", margin: "0 4px" }} />
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("formatBlock", "h2")} title="제목">H2</button>
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("formatBlock", "h3")} title="소제목">H3</button>
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("formatBlock", "p")} title="본문">P</button>
                <span style={{ width: "1px", background: "var(--color-border, #d1d5db)", margin: "0 4px" }} />
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("insertUnorderedList")} title="목록">• 목록</button>
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("insertOrderedList")} title="번호목록">1. 목록</button>
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("formatBlock", "blockquote")} title="인용">❝ 인용</button>
                <span style={{ width: "1px", background: "var(--color-border, #d1d5db)", margin: "0 4px" }} />
                <button type="button" style={toolbarBtnStyle} onClick={handleLink} title="링크">🔗 링크</button>
                <button type="button" style={toolbarBtnStyle} onClick={() => execCommand("removeFormat")} title="서식 제거">✕ 초기화</button>
            </div>

            {/* Editable area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                style={{
                    minHeight: "350px",
                    padding: "16px",
                    outline: "none",
                    fontSize: "15px",
                    lineHeight: 1.7,
                    color: "#222",
                    fontFamily: "inherit",
                }}
            />
        </div>
    );
}
