"use client";

import { useEffect, useState } from "react";
import type { ImpactCounters } from "./impactData";
import type { ImpactMessage } from "./impactData";
import styles from "./game.module.css";

interface ImpactCardProps {
    impact: ImpactMessage | null;
    counters: ImpactCounters;
    onDismiss: () => void;
}

export default function ImpactCard({ impact, counters, onDismiss }: ImpactCardProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (impact) {
            setVisible(true);
        }
    }, [impact]);

    if (!impact || !visible) return null;

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(onDismiss, 300);
    };

    const hasCounters = counters.intimidatedProsecutors > 0 
        || counters.silencedWitnesses > 0 
        || counters.unverifiedAmount > 0 
        || counters.abandonedVictims > 0;

    return (
        <div className={styles.impactOverlay} onClick={handleDismiss}>
            <div className={`${styles.impactCard} ${visible ? styles["impactCard--enter"] : ""}`}>
                <div className={styles.impactCardHeader}>📊 당신의 행동이 만든 결과</div>
                <div className={styles.impactCardBody}>
                    <div className={styles.impactCardEmoji}>{impact.emoji}</div>
                    <p className={styles.impactCardText}>{impact.text}</p>
                </div>

                {hasCounters && (
                    <div className={styles.impactCounters}>
                        {counters.intimidatedProsecutors > 0 && (
                            <div className={styles.impactCounterItem}>
                                <span className={styles.impactCounterIcon}>😰</span>
                                <span className={styles.impactCounterLabel}>위축된 검사</span>
                                <strong className={styles.impactCounterValue}>{counters.intimidatedProsecutors}명</strong>
                            </div>
                        )}
                        {counters.silencedWitnesses > 0 && (
                            <div className={styles.impactCounterItem}>
                                <span className={styles.impactCounterIcon}>🤐</span>
                                <span className={styles.impactCounterLabel}>침묵한 증인</span>
                                <strong className={styles.impactCounterValue}>{counters.silencedWitnesses}명</strong>
                            </div>
                        )}
                        {counters.abandonedVictims > 0 && (
                            <div className={styles.impactCounterItem}>
                                <span className={styles.impactCounterIcon}>😢</span>
                                <span className={styles.impactCounterLabel}>포기한 피해자</span>
                                <strong className={styles.impactCounterValue}>{counters.abandonedVictims}명</strong>
                            </div>
                        )}
                        {counters.unverifiedAmount > 0 && (
                            <div className={styles.impactCounterItem}>
                                <span className={styles.impactCounterIcon}>💰</span>
                                <span className={styles.impactCounterLabel}>미확인 금액</span>
                                <strong className={styles.impactCounterValue}>{counters.unverifiedAmount.toLocaleString()}억</strong>
                            </div>
                        )}
                    </div>
                )}

                <button className={styles.impactDismissBtn} onClick={handleDismiss}>
                    ▼ 탭하여 계속
                </button>
            </div>
        </div>
    );
}
