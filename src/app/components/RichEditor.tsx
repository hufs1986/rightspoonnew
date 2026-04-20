"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// @ts-ignore
const QuillNoSSRWrapper = dynamic(() => import("react-quill"), {
    ssr: false,
    loading: () => <p>에디터 불러오는 중...</p>,
});

const modules = {
    toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
        ],
        ["link"],
        [{ color: [] }, { background: [] }],
        ["clean"],
    ],
};

const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "color",
    "background",
];

interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
    return (
        <QuillNoSSRWrapper
            // @ts-ignore
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            theme="snow"
            style={{ minHeight: "350px", background: "white", borderRadius: "8px", overflow: "hidden" }}
        />
    );
}
