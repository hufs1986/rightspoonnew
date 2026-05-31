import Header from "./components/Header";
import Footer from "./components/Footer";
import { ArticleCard, HeroArticle } from "./components/ArticleCard";

import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

import { formatArticle } from "@/utils/articleFormat";
import LoadMore from "./components/LoadMore";

export const revalidate = 60; // Cache for 60 seconds

export default async function Home() {
  const supabase = await createClient();

  // Supabase에서 기사 가져오기
  const { data: dbArticles, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("데이터 불러오기 실패:", error);
  }

  // 기사가 없는 경우
  if (!dbArticles || dbArticles.length === 0) {
    return (
      <div className={styles.main}>
        <Header />
        <div style={{ textAlign: "center", padding: "150px 20px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>아직 등록된 기사가 없습니다.</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px" }}>관리자 페이지에서 영상을 등록해보세요!</p>
          <Link href="/admin/write" className="btn btn--primary">
            관리자 글쓰기 페이지로 이동
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedArticles = dbArticles.map(formatArticle);

  const heroArticle = formattedArticles[0];
  const latestArticles = formattedArticles.slice(1);

  // 홈페이지 JSON-LD (WebSite + Organization)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "오른스푼",
        "alternateName": "Right Spoon",
        "url": "https://www.rightspoon.co.kr",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.rightspoon.co.kr/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "오른스푼",
        "url": "https://www.rightspoon.co.kr",
        "logo": "https://www.rightspoon.co.kr/logo-character.webp",
        "sameAs": [
          "https://youtube.com/channel/UCzoap467OGtjhLk5qmU53OA"
        ]
      }
    ]
  };

  return (
    <div className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <section className={styles.homeIntro}>
        <div className={styles.homeIntro__copy}>
          <div className={styles.homeIntro__eyebrow}>드럼통119</div>
          <h1 className={styles.homeIntro__title}>
            오른쪽 시각으로 다시 쓰는 정치·사회 해설
          </h1>
          <p className={styles.homeIntro__desc}>
            오른스푼은 매일 쏟아지는 이슈 중 오래 남길 주제만 골라 정리하는 해설 미디어입니다.
          </p>
          <div className={styles.homeIntro__actions}>
            <Link href="/category/all" className="btn btn--primary">
              최신 해설 읽기
            </Link>
            <Link href="/about" className="btn btn--outline">
              운영자 소개
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className={styles["hero-section"]}>
        <div className={styles.section__header}>
          <h2 className={styles.section__title}>
            <span className={styles["section__title-accent"]} />
            오늘의 대표 해설
          </h2>
        </div>
        <HeroArticle article={heroArticle} />
      </section>

      {/* Latest Articles */}
      <section className={styles.section}>
        <div className={styles.section__header}>
          <h2 className={styles.section__title}>
            <span className={styles["section__title-accent"]} />
            최신 해설
          </h2>
          {latestArticles.length > 0 && (
            <Link href="/category/all" className={styles.section__more}>
              전체보기 →
            </Link>
          )}
        </div>

        {/* Category Filter */}
        <div className={styles.filter}>
          <Link
            href="/category/all"
            className={`${styles.filter__btn} ${styles["filter__btn--active"]}`}
          >
            전체
          </Link>
          <Link href="/category/politics" className={styles.filter__btn}>정치</Link>
          <Link href="/category/economy" className={styles.filter__btn}>경제</Link>
          <Link href="/category/history" className={styles.filter__btn}>역사</Link>
        </div>

        {/* Articles Grid */}
        <div className={`${styles.grid} stagger`}>
          {latestArticles.length > 0 ? (
            <>
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              <LoadMore initialOffset={10} category="전체" />
            </>
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "100px 20px", background: "var(--color-bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", minHeight: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <img src="/logo-character.webp" alt="character" style={{ width: "100px", borderRadius: "50%", margin: "0 auto 20px", border: "2px solid var(--color-accent)", opacity: 0.8 }} />
              <h3 style={{ color: "var(--color-text-primary)", fontSize: "24px", marginBottom: "12px", fontWeight: "bold" }}>더 많은 콘텐츠가 준비 중입니다!</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "16px" }}>불 드럼통119 캐릭터와 함께하는 다양한 우파 콘텐츠가 곧 업로드됩니다.</p>
            </div>
          )}
        </div>
      </section>



      <Footer />
    </div>
  );
}
