import Link from "next/link";
import styles from "./Footer.module.css";
import SiteStats from "./SiteStats";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__inner}>
                {/* Brand */}
                <div>
                    <div className={styles["footer__brand-name"]}>RIGHT SPOON</div>
                    <p className={styles["footer__brand-desc"]}>
                        드럼통119의 정치·사회 해설 본진입니다.
                        흘러가는 이슈를 오른쪽 시각의 글 자산으로 남깁니다.
                    </p>
                    <div className={styles.footer__socials}>
                        <a
                            href="https://youtube.com/channel/UCzoap467OGtjhLk5qmU53OA?si=qKPByMpqOz1bq44J"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles["footer__social-link"]}
                            aria-label="YouTube"
                        >
                            ▶
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
                        <Link href="/from-instagram" className={styles.footer__link}>
                            인스타 방문자 안내
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
                        <Link href="/editorial-policy" className={styles.footer__link}>
                            편집 원칙
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.footer__bottom}>
                <SiteStats />
                <span className={styles.footer__copyright}>
                    © 2026 오른스푼(Right Spoon). All rights reserved.
                </span>
            </div>
        </footer>
    );
}
