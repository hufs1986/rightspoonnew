"use client";

import styles from "./game.module.css";
import { STORE_CTA_COPY, STORE_DISCLOSURE, STORE_URL } from "./storeCtaData";
import { trackGameEvent } from "./tracking";

type StoreCtaVariant = "title" | "inGame" | "ending";

interface StoreCtaProps {
    variant: StoreCtaVariant;
}

export default function StoreCta({ variant }: StoreCtaProps) {
    const copy = STORE_CTA_COPY[variant];

    return (
        <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.storeCta} ${styles[`storeCta--${variant}`]}`}
            onClick={() =>
                trackGameEvent("indictment_store_click", {
                    location: variant,
                    button_label: copy.button,
                    destination: "coupang_influencer_store",
                })
            }
        >
            <div className={styles.storeCtaHeader}>
                <span className={styles.storeCtaKicker}>{copy.kicker}</span>
                <span className={styles.storeCtaArrow}>↗</span>
            </div>
            <div className={styles.storeCtaTitle}>{copy.title}</div>
            <div className={styles.storeCtaBody}>{copy.body}</div>
            <div className={styles.storeCtaFooter}>
                <span className={styles.storeCtaButton}>{copy.button}</span>
                <span className={styles.storeCtaDisclosure}>{STORE_DISCLOSURE}</span>
            </div>
        </a>
    );
}
