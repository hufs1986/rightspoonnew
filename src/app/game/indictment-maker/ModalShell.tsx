"use client";

import { useEffect, useRef } from "react";
import styles from "./game.module.css";

interface ModalShellProps {
    children: React.ReactNode;
    className?: string;
    closeOnBackdrop?: boolean;
    labelledBy?: string;
    onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(", ");

export default function ModalShell({
    children,
    className,
    closeOnBackdrop = true,
    labelledBy,
    onClose,
}: ModalShellProps) {
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const panel = panelRef.current;
        const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        const firstFocusable = focusable?.[0];
        const lastFocusable = focusable?.[focusable.length - 1];
        firstFocusable?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }

            if (event.key !== "Tab" || !panel || !focusable || focusable.length === 0) return;

            if (event.shiftKey && document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable?.focus();
                return;
            }

            if (!event.shiftKey && document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className={styles.eventOverlay}
            onClick={() => {
                if (closeOnBackdrop) onClose();
            }}
        >
            <div
                ref={panelRef}
                aria-labelledby={labelledBy}
                aria-modal="true"
                className={className}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
            >
                {children}
            </div>
        </div>
    );
}
