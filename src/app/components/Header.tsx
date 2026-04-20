"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import styles from "./Header.module.css";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.header__inner}>
                {/* Logo */}
                <Link href="/" className={styles.header__logo}>
                    <Image
                        src="/logo-character.webp"
                        alt="드럼통119"
                        width={40}
                        height={40}
                        priority
                        className={styles["header__logo-icon"]}
                    />
                    <span className={styles["header__logo-text"]}>RIGHT SPOON</span>
                    <span className={styles["header__logo-sub"]}>by 드럼통119</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className={styles.header__nav}>
                    <Link href="/" className={`${styles["header__nav-link"]} ${styles["header__nav-link--active"]}`}>
                        홈
                    </Link>
                    <Link href="/category/politics" className={styles["header__nav-link"]}>
                        정치
                    </Link>
                    <Link href="/category/economy" className={styles["header__nav-link"]}>
                        경제
                    </Link>
                    <Link href="/category/history" className={styles["header__nav-link"]}>
                        역사
                    </Link>
                    <Link href="/about" className={styles["header__nav-link"]}>
                        소개
                    </Link>
                </nav>

                {/* Actions: Search + Mobile Menu */}
                <div className={styles.header__actions}>
                    <SearchBar />
                    <button
                        className={styles["header__menu-toggle"]}
                        aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {menuOpen && (
                <div className={styles["header__mobile-drawer"]}>
                    <Link href="/" className={styles["header__mobile-link"]} onClick={() => setMenuOpen(false)}>
                        홈
                    </Link>
                    <Link href="/category/politics" className={styles["header__mobile-link"]} onClick={() => setMenuOpen(false)}>
                        정치
                    </Link>
                    <Link href="/category/economy" className={styles["header__mobile-link"]} onClick={() => setMenuOpen(false)}>
                        경제
                    </Link>
                    <Link href="/category/history" className={styles["header__mobile-link"]} onClick={() => setMenuOpen(false)}>
                        역사
                    </Link>
                    <Link href="/about" className={styles["header__mobile-link"]} onClick={() => setMenuOpen(false)}>
                        소개
                    </Link>
                </div>
            )}
        </header>
    );
}
