"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BG_IMAGES, CHARACTER_META, type ScreenEffect } from "./dialogueData";
import type { StoryNode, StoryChoice } from "./storyData";
import styles from "./game.module.css";

interface DialogueSystemProps {
    node: StoryNode;
    onChoiceMade: (choice: StoryChoice) => void;
    onNextNode: (nextNodeId: string) => void;
    onEnding: (endingId: string) => void;
}

const TYPING_SPEED = 35; // ms per character

export default function DialogueSystem({ node, onChoiceMade, onNextNode, onEnding }: DialogueSystemProps) {
    const [lineIndex, setLineIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const [activeEffect, setActiveEffect] = useState<ScreenEffect>("none");
    const [showChoices, setShowChoices] = useState(false);
    const timerRef = useRef<number | null>(null);

    // Reset when node changes
    useEffect(() => {
        setLineIndex(0);
        setShowChoices(false);
    }, [node.id]);

    const currentLine = node.lines[lineIndex];
    const charMeta = currentLine ? CHARACTER_META[currentLine.character] : null;
    const bgUrl = BG_IMAGES[node.background];

    // Typing animation
    useEffect(() => {
        if (!currentLine) return;

        setDisplayedText("");
        setIsTyping(true);
        setShowChoices(false);

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
                if (lineIndex === node.lines.length - 1 && node.choices && node.choices.length > 0) {
                    setShowChoices(true);
                }
            }
        };

        timerRef.current = window.setTimeout(tick, TYPING_SPEED);

        return () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        };
    }, [lineIndex, currentLine, node]);

    const advance = useCallback(() => {
        if (showChoices) return; // Wait for choice to be clicked

        if (isTyping) {
            // Skip to end of current line
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
            if (currentLine) setDisplayedText(currentLine.text);
            setIsTyping(false);
            if (lineIndex === node.lines.length - 1 && node.choices && node.choices.length > 0) {
                setShowChoices(true);
            }
            return;
        }

        if (lineIndex < node.lines.length - 1) {
            setLineIndex((prev) => prev + 1);
        } else {
            // End of node
            if (node.isEnding && node.endingId) {
                onEnding(node.endingId);
            } else if (node.nextNodeId && (!node.choices || node.choices.length === 0)) {
                onNextNode(node.nextNodeId);
            }
        }
    }, [isTyping, lineIndex, node, currentLine, showChoices, onNextNode, onEnding]);

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

    const showLeft = charMeta.position === "left" && charMeta.image;
    const showRight = charMeta.position === "right" && charMeta.image;
    const showCenter = charMeta.position === "center" && charMeta.image;

    return (
        <div className={styles.vnContainer} onClick={advance}>
            {/* Background */}
            <div
                className={`${styles.vnBg} ${effectClass}`}
                style={{ backgroundImage: bgUrl ? `url('${bgUrl}')` : 'none', backgroundColor: bgUrl ? 'transparent' : '#000' }}
            />

            {/* Characters */}
            <div className={`${styles.vnCharContainer} ${effectClass}`}>
                {showLeft && <img src={charMeta.image} className={`${styles.vnChar} ${styles.vnCharLeft}`} alt="left char" />}
                {showCenter && <img src={charMeta.image} className={`${styles.vnChar} ${styles.vnCharCenter}`} alt="center char" />}
                {showRight && <img src={charMeta.image} className={`${styles.vnChar} ${styles.vnCharRight}`} alt="right char" />}
            </div>

            {/* Emotion / Context text overhead */}


            {/* Dialogue Box */}
            <div className={`${styles.vnDialogBox} ${effectClass}`}>
                {charMeta.name && <div className={styles.vnSpeakerName}>{charMeta.name}</div>}
                <div className={styles.vnDialogText}>
                    {displayedText}
                    {!isTyping && !showChoices && <span className={styles.vnBlinkArrow}>▼</span>}
                </div>
            </div>

            {/* Choices Box */}
            {showChoices && node.choices && (
                <div className={styles.vnChoicesContainer} onClick={(e) => e.stopPropagation()}>
                    {node.choices.map((choice, idx) => (
                        <button
                            key={idx}
                            className={styles.vnChoiceBtn}
                            onClick={() => onChoiceMade(choice)}
                        >
                            {choice.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
