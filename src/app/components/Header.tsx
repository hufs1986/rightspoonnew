"use client";

import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.header__inner}>
                {/* Logo */}
                <Link href="/" className={styles.header__logo}>
                    <span className={styles["header__logo-icon"]}>R</span>
                    <span className={styles["header__logo-text"]}>RIGHT SPOON</span>
                    <span className={styles["header__logo-sub"]}>미디어</span>
                </Link>

                {/* Navigation */}
                <nav className={styles.header__nav}>
                    <Link
                        href="/"
                        className={`${styles["header__nav-link"]} ${styles["header__nav-link--active"]}`}
                    >
                        홈
                    </Link>
                    <Link href="/category/politics" className={styles["header__nav-link"]}>
                        정치
                    </Link>
                    <Link href="/category/economy" className={styles["header__nav-link"]}>
                        경제
                    </Link>
                    <Link href="/about" className={styles["header__nav-link"]}>
                        소개
                    </Link>
                </nav>

                {/* Actions */}
                <div className={styles.header__actions}>
                    <Link href="/login" className={styles["header__login-btn"]}>
                        로그인
                    </Link>
                    <Link href="/register" className={styles["header__register-btn"]}>
                        가입 신청
                    </Link>
                    <button
                        className={styles["header__menu-toggle"]}
                        aria-label="메뉴 열기"
                    >
                        ☰
                    </button>
                </div>
            </div>
        </header>
    );
}
