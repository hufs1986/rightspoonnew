"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./game.module.css";

interface CitizenVoiceProps {
    message: string | null;
}

const TYPING_SPEED = 30;

export default function CitizenVoice({ message }: CitizenVoiceProps) {
    const [displayed, setDisplayed] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const timerRef = useRef<number | null>(null);
    const prevMessage = useRef<string | null>(null);

    useEffect(() => {
        if (!message || message === prevMessage.current) return;
        prevMessage.current = message;
        setDisplayed("");
        setIsTyping(true);

        let idx = 0;
        const tick = () => {
            idx++;
            setDisplayed(message.slice(0, idx));
            if (idx < message.length) {
                timerRef.current = window.setTimeout(tick, TYPING_SPEED);
            } else {
                setIsTyping(false);
            }
        };
        timerRef.current = window.setTimeout(tick, TYPING_SPEED);

        return () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        };
    }, [message]);

    if (!message) return null;

    return (
        <div className={styles.citizenVoice}>
            <div className={styles.citizenVoiceIcon}>👤</div>
            <div className={styles.citizenVoiceContent}>
                <div className={styles.citizenVoiceLabel}>시민의 한마디</div>
                <div className={styles.citizenVoiceText}>
                    {displayed}
                    {isTyping && <span className={styles.vnCursor}>▌</span>}
                </div>
            </div>
        </div>
    );
}
