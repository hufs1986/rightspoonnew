import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__inner}>
                {/* Brand */}
                <div>
                    <div className={styles["footer__brand-name"]}>RIGHT SPOON</div>
                    <p className={styles["footer__brand-desc"]}>
                        대한민국 오른 시각의 뉴스와 칼럼을 전합니다.
                        깊이 있는 분석과 사실에 기반한 미디어를 지향합니다.
                    </p>
                    <div className={styles.footer__socials}>
                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles["footer__social-link"]}
                            aria-label="YouTube"
                        >
                            ▶
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles["footer__social-link"]}
                            aria-label="Instagram"
                        >
                            📷
                        </a>
                        <a
                            href="https://tiktok.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles["footer__social-link"]}
                            aria-label="TikTok"
                        >
                            🎵
                        </a>
                    </div>
                </div>

                {/* Category */}
                <div>
                    <h3 className={styles["footer__section-title"]}>카테고리</h3>
                    <div className={styles.footer__links}>
                        <Link href="/category/politics" className={styles.footer__link}>
                            정치
                        </Link>
                        <Link href="/category/economy" className={styles.footer__link}>
                            경제
                        </Link>
                        <Link href="/category/history" className={styles.footer__link}>
                            역사
                        </Link>
                    </div>
                </div>

                {/* Service */}
                <div>
                    <h3 className={styles["footer__section-title"]}>서비스</h3>
                    <div className={styles.footer__links}>
                        <Link href="/about" className={styles.footer__link}>
                            소개
                        </Link>
                    </div>
                </div>

                {/* Legal */}
                <div>
                    <h3 className={styles["footer__section-title"]}>정책</h3>
                    <div className={styles.footer__links}>
                        <Link href="/privacy" className={styles.footer__link}>
                            개인정보처리방침
                        </Link>
                        <Link href="/terms" className={styles.footer__link}>
                            이용약관
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.footer__bottom}>
                <span className={styles.footer__copyright}>
                    © 2026 오른스푼(Right Spoon). All rights reserved.
                </span>
            </div>
        </footer>
    );
}
