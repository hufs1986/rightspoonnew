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
          <div className={styles.homeIntro__eyebrow}>드럼통119의 정치·사회 해설 본진</div>
          <h1 className={styles.homeIntro__title}>
            흘러가는 이슈를 붙잡아, 오른쪽 시각으로 다시 씁니다.
          </h1>
          <p className={styles.homeIntro__desc}>
            오른스푼은 인스타그램과 유튜브에서 짧게 지나가는 정치·사회 이슈를 글로 축적하는 1인 미디어입니다.
            뉴스 복사가 아니라, 사건의 프레임과 쟁점을 운영자의 관점으로 정리합니다.
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
        <aside className={styles.homeIntro__panel} aria-label="오른스푼 사용 안내">
          <strong>인스타에서 오셨다면</strong>
          <span>짧은 문장으로 끝낸 이슈의 전체 맥락과 근거를 여기에서 이어서 읽을 수 있습니다.</span>
          <span>마음에 남는 글은 링크로 저장하고 공유하세요. 이곳이 오른스푼의 아카이브입니다.</span>
          <Link href="/from-instagram" className={styles.homeIntro__textLink}>
            처음 오신 분들을 위한 안내 보기
          </Link>
        </aside>
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

      <section className={styles.instagramBridge}>
        <div>
          <strong>인스타 반응을 오른스푼 자산으로</strong>
          <p>
            짧은 릴스와 피드에서 반응이 있었던 주제는 오른스푼에서 긴 해설로 정리합니다.
            저장 가능한 글, 공유 가능한 링크, 검색되는 아카이브로 남기는 것이 목표입니다.
          </p>
        </div>
        <Link href="/from-instagram" className="btn btn--primary">
          인스타 방문자 안내
        </Link>
      </section>

      <section className={styles.workflow}>
        <div className={styles.workflow__copy}>
          <span>운영 방식</span>
          <h2>뉴스를 그대로 옮기지 않고, 해설 자산으로 바꿉니다.</h2>
          <p>
            매일 쏟아지는 이슈 중 오래 남길 주제만 고르고, AI 초안으로 구조를 잡은 뒤
            드럼통119의 관점과 문장으로 다시 편집해 발행합니다.
          </p>
        </div>
        <div className={styles.workflow__steps}>
          <div>
            <strong>1. 소재 수집</strong>
            <p>뉴스, 공식자료, 인스타 반응에서 주제를 고릅니다.</p>
          </div>
          <div>
            <strong>2. AI 구조화</strong>
            <p>사실관계, 상대 프레임, 핵심 질문을 초안으로 만듭니다.</p>
          </div>
          <div>
            <strong>3. 운영자 편집</strong>
            <p>관점, 근거, 결론을 보강해 오른스푼 글로 발행합니다.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
