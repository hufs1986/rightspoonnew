"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    BG_IMAGES,
    CHARACTER_META,
    type DialogueLine,
    type DialogueSequence,
    type ScreenEffect,
} from "./dialogueData";
import styles from "./game.module.css";

interface DialogueSystemProps {
    sequence: DialogueSequence;
    onComplete: () => void;
}

const TYPING_SPEED = 35; // ms per character

export default function DialogueSystem({ sequence, onComplete }: DialogueSystemProps) {
    const [lineIndex, setLineIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const [activeEffect, setActiveEffect] = useState<ScreenEffect>("none");
    const timerRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentLine: DialogueLine | undefined = sequence.lines[lineIndex];
    const charMeta = currentLine ? CHARACTER_META[currentLine.character] : null;
    const bgUrl = BG_IMAGES[sequence.background];

    // Typing animation
    useEffect(() => {
        if (!currentLine) return;

        setDisplayedText("");
        setIsTyping(true);

        if (currentLine.effect && currentLine.effect !== "none") {
            setActiveEffect(currentLine.effect);
            setTimeout(() => setActiveEffect("none"), 600);
        }

        let charIdx = 0;
        const fullText = currentLine.text;

        const tick = () => {
            charIdx++;
            setDisplayedText(fullText.slice(0, charIdx));
            if (charIdx < fullText.length) {
                timerRef.current = window.setTimeout(tick, TYPING_SPEED);
            } else {
                setIsTyping(false);
            }
        };

        timerRef.current = window.setTimeout(tick, TYPING_SPEED);

        return () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        };
    }, [lineIndex, currentLine]);

    const advance = useCallback(() => {
        if (isTyping) {
            // Skip to end of current line
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
            if (currentLine) setDisplayedText(currentLine.text);
            setIsTyping(false);
            return;
        }

        if (lineIndex < sequence.lines.length - 1) {
            setLineIndex((prev) => prev + 1);
        } else {
            onComplete();
        }
    }, [isTyping, lineIndex, sequence.lines.length, currentLine, onComplete]);

    // Click / tap / key to advance
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                advance();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [advance]);

    if (!currentLine || !charMeta) return null;

    const effectClass =
        activeEffect === "shake" ? styles.vnShake
            : activeEffect === "flash" ? styles.vnFlash
                : activeEffect === "slam" ? styles.vnSlam
                    : "";

    // Determine which characters to show
    const leftChar = charMeta.position === "left" ? charMeta : null;
    const rightChar = charMeta.position === "right" ? charMeta : null;
    const centerChar = charMeta.position === "center" && currentLine.character !== "narrator" ? charMeta : null;

    return (
        <div
            ref={containerRef}
            className={`${styles.vnContainer} ${effectClass}`}
            onClick={advance}
            role="button"
            tabIndex={0}
            aria-label="다음 대사로 진행"
        >
            {/* Background */}
            {bgUrl && (
                <div className={styles.vnBg} style={{ backgroundImage: `url(${bgUrl})` }} />
            )}
            <div className={styles.vnBgOverlay} />

            {/* Characters */}
            <div className={styles.vnCharacters}>
                {leftChar && leftChar.image && (
                    <div className={`${styles.vnCharLeft} ${styles.vnCharEnter}`}>
                        <img src={leftChar.image} alt={leftChar.name} className={styles.vnCharImg} />
                    </div>
                )}
                {centerChar && centerChar.image && (
                    <div className={`${styles.vnCharCenter} ${styles.vnCharEnter}`}>
                        <img src={centerChar.image} alt={centerChar.name} className={styles.vnCharImg} />
                    </div>
                )}
                {rightChar && rightChar.image && (
                    <div className={`${styles.vnCharRight} ${styles.vnCharEnter}`}>
                        <img src={rightChar.image} alt={rightChar.name} className={styles.vnCharImg} />
                    </div>
                )}
            </div>

            {/* Dialogue Box */}
            <div className={styles.vnDialogueBox}>
                {charMeta.name && (
                    <div className={styles.vnSpeakerName}>{charMeta.name}</div>
                )}
                <div className={styles.vnDialogueText}>
                    {displayedText}
                    {isTyping && <span className={styles.vnCursor}>▌</span>}
                </div>
                {!isTyping && (
                    <div className={styles.vnAdvanceHint}>▼ 탭하여 계속</div>
                )}
            </div>

            {/* Progress dots */}
            <div className={styles.vnProgress}>
                {sequence.lines.map((_, i) => (
                    <span
                        key={i}
                        className={`${styles.vnDot} ${i === lineIndex ? styles["vnDot--active"] : ""} ${i < lineIndex ? styles["vnDot--done"] : ""}`}
                    />
                ))}
            </div>
        </div>
    );
}
