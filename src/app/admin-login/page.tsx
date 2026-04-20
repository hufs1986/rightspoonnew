"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./login.module.css";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
            setIsLoading(false);
        } else {
            // 성공 시 관리자 대시보드로 이동
            window.location.href = "/admin";
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <img
                        src="/logo-character.webp"
                        alt="드럼통119"
                        className={styles.loginLogo}
                    />
                    <h1 className={styles.loginTitle}>관리자 로그인</h1>
                    <p className={styles.loginDesc}>
                        콘텐츠 관리를 위해 관리자 계정으로 로그인하세요.
                    </p>
                </div>

                <form onSubmit={handleLogin} className={styles.loginForm}>
                    {error && <div className={styles.loginError}>{error}</div>}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>이메일</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@rightspoon.co.kr"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>비밀번호</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.loginBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                <div className={styles.loginFooter}>
                    <a href="/" className={styles.backLink}>
                        ← 홈으로 돌아가기
                    </a>
                </div>
            </div>
        </div>
    );
}
