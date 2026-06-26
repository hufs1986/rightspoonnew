import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./about.module.css";

import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
    title: "소개",
    description: "오른스푼은 드럼통119의 정치·사회 해설 본진입니다. 흘러가는 이슈를 붙잡아 글로 남깁니다.",
    urlPath: "/about",
    imageUrl: "https://www.rightspoon.co.kr/logo-character.webp"
});

export default function AboutPage() {
    return (
        <div className={styles.main}>
            <Header />

            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroIdentity}>
                        <img
                            src="/logo-character.webp"
                            alt="드럼통119"
                            className={styles.heroLogo}
                        />
                        <span>드럼통119의 본진</span>
                    </div>
                    <h1 className={styles.heroTitle}>
                        오른스푼은 흘러가는 이슈를 붙잡아
                        오른쪽 시각으로 다시 쓰는 해설 저장소입니다.
                    </h1>
                    <p className={styles.heroDesc}>
                        인스타그램과 유튜브에서는 짧게 반응하고, 오른스푼에서는 맥락과 근거를 붙여 글로 남깁니다.
                        플랫폼 알고리즘에 흘러가지 않도록 내 도메인에 쌓는 1인 정치·사회 미디어입니다.
                    </p>
                    <div className={styles.heroActions}>
                        <Link href="/from-instagram" className={styles.primaryAction}>
                            처음 오셨다면
                        </Link>
                        <Link href="/category/all" className={styles.secondaryAction}>
                            최신 해설 보기
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.content}>
                <section className={styles.statement}>
                    <p className={styles.kicker}>왜 만들었나</p>
                    <h2>인스타 반응은 빠르지만, 내 자산으로 남지 않습니다.</h2>
                    <p>
                        오른스푼은 드럼통119가 매일 보는 정치·사회 이슈를 검색 가능한 글로 축적하기 위해 만들었습니다.
                        짧은 분노나 단발성 밈에서 끝내지 않고, 사건의 구조와 프레임, 독자가 확인해야 할 질문을 남깁니다.
                    </p>
                </section>

                <div className={styles.grid}>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>01</span>
                        <h3 className={styles.cardTitle}>뉴스를 베끼지 않습니다</h3>
                        <p className={styles.cardDesc}>
                            공개된 이슈와 자료를 바탕으로, 오른스푼의 관점과 해석을 붙여 다시 씁니다.
                            핵심은 속보가 아니라 판단의 기준입니다.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>02</span>
                        <h3 className={styles.cardTitle}>짧은 반응을 긴 해설로 바꿉니다</h3>
                        <p className={styles.cardDesc}>
                            인스타그램에서 반응이 온 주제는 오른스푼에서 배경, 상대 프레임, 결론까지 정리합니다.
                            공유보다 중요한 것은 남는 기록입니다.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>03</span>
                        <h3 className={styles.cardTitle}>입문자도 따라오게 만듭니다</h3>
                        <p className={styles.cardDesc}>
                            정치·경제·역사 이슈를 처음 접하는 독자도 맥락을 놓치지 않도록 쉬운 구조로 정리합니다.
                            다시 읽을 수 있는 글을 목표로 합니다.
                        </p>
                    </div>
                </div>

                <section className={styles.readGuide}>
                    <div>
                        <p className={styles.kicker}>읽는 방법</p>
                        <h2>오른스푼은 이렇게 읽으면 됩니다.</h2>
                    </div>
                    <div className={styles.guideList}>
                        <div>
                            <strong>오늘의 해설</strong>
                            <span>지금 논쟁이 되는 이슈를 오른쪽 시각으로 정리합니다.</span>
                        </div>
                        <div>
                            <strong>인스타 확장판</strong>
                            <span>짧은 게시물에서 못 다한 근거와 맥락을 이어갑니다.</span>
                        </div>
                        <div>
                            <strong>입문서</strong>
                            <span>반복해서 등장하는 정치·경제·역사 개념을 보관합니다.</span>
                        </div>
                    </div>
                </section>

                <section className={styles.channels}>
                    <div>
                        <p className={styles.kicker}>연결</p>
                        <h2 className={styles.channelsTitle}>짧게 보고, 길게 읽고, 다시 공유합니다.</h2>
                    </div>
                    <div className={styles.channelGrid}>
                        <Link href="/from-instagram" className={styles.channelLink}>
                            인스타 방문자 안내
                        </Link>
                        <Link href="/category/all" className={styles.channelLink}>
                            전체 글 보기
                        </Link>
                        <a href="https://youtube.com/channel/UCzoap467OGtjhLk5qmU53OA?si=qKPByMpqOz1bq44J" target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
                            YouTube
                        </a>
                    </div>
                </section>

                <section className={styles.contact}>
                    <p>제보와 협업 문의</p>
                    <a href="mailto:drumtong119@gmail.com">drumtong119@gmail.com</a>
                </section>
            </section>

            <Footer />
        </div>
    );
}
