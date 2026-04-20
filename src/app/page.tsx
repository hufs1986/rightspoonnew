import Header from "./components/Header";
import Footer from "./components/Footer";
import { ArticleCard, HeroArticle } from "./components/ArticleCard";
import AdSlot from "./components/AdSlot";
import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getCategoryValue } from "./data/articles";

export const revalidate = 0; // Disable cache for immediate refresh

export default async function Home() {
  const supabase = await createClient();

  // Supabase에서 기사 가져오기
  const { data: dbArticles, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

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

  // Helper: youtube ID 에서 slash 등 정리 (또는 DB에 잘못 저장된 전체 URL에서 ID 추출)
  const cleanYoutubeId = (id: string) => {
    if (!id) return '';
    // Full URL → extract 11-char video ID
    const match = id.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match) return match[1];
    // Already a bare ID (possibly with trailing junk)
    const cleaned = id.replace(/[\/?#&].*/g, '').trim();
    return /^[\w-]{11}$/.test(cleaned) ? cleaned : '';
  };

  // Helper: HTML 태그 제거 (Rich Editor content에서 excerpt 추출)
  const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';

  // 데이터 포맷팅 (DB -> 컴포넌트 프롭스 구조)
  const formattedArticles = dbArticles.map((a) => ({
    id: a.id,
    title: a.title,
    excerpt: stripHtml(typeof a.content === 'string' ? a.content : '').substring(0, 100) + '...',
    category: getCategoryValue(a.category),
    categoryLabel: a.category,
    content: a.content,
    author: a.author,
    youtubeId: cleanYoutubeId(a.youtube_id),
    thumbnailUrl: cleanYoutubeId(a.youtube_id)
      ? `https://img.youtube.com/vi/${cleanYoutubeId(a.youtube_id)}/0.jpg`
      : "",
    publishedAt: new Date(a.created_at).toLocaleDateString(),
    readTime: a.read_time,
    views: a.view_count,
  }));

  const heroArticle = formattedArticles[0];
  const latestArticles = formattedArticles.slice(1);

  return (
    <div className={styles.main}>
      <Header />

      {/* Breaking News Ticker */}
      <div className={styles.ticker}>
        <div className={styles.ticker__inner}>
          <span className={styles.ticker__label}>긴급</span>
          <span className={styles.ticker__text}>
            대한민국 보수의 심장, 오른스푼 론칭! 올바른 시각의 소식을 매일 전해드립니다. 유튜브 채널을 구독하고 더 많은 소식을 받아보세요! &nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;
          </span>
          <span className={styles.ticker__text}>
            대한민국 보수의 심장, 오른스푼 론칭! 올바른 시각의 소식을 매일 전해드립니다. 유튜브 채널을 구독하고 더 많은 소식을 받아보세요! &nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className={styles["hero-section"]}>
        <HeroArticle article={heroArticle} />
      </section>

      {/* Latest Articles */}
      <section className={styles.section}>
        <div className={styles.section__header}>
          <h2 className={styles.section__title}>
            <span className={styles["section__title-accent"]} />
            최신 콘텐츠
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
            latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "100px 20px", background: "var(--color-bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", minHeight: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <img src="/logo-character.jpg" alt="character" style={{ width: "100px", borderRadius: "50%", margin: "0 auto 20px", border: "2px solid var(--color-accent)", opacity: 0.8 }} />
              <h3 style={{ color: "var(--color-text-primary)", fontSize: "24px", marginBottom: "12px", fontWeight: "bold" }}>더 많은 콘텐츠가 준비 중입니다!</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "16px" }}>불 드럼통119 캐릭터와 함께하는 다양한 우파 콘텐츠가 곧 업로드됩니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section className={styles.cta}>
        <div className={styles.cta__inner}>
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src="/logo-character.jpg" alt="드럼통119" style={{ width: "100px", height: "100px", borderRadius: "50%", border: "3px solid #d32f2f", boxShadow: "0 0 20px rgba(211,47,47,0.5)", marginBottom: "20px" }} />
            <h2 className={styles.cta__title}>
              대한민국 오른 목소리, 유튜브에서!
            </h2>
            <p className={styles.cta__desc} style={{ fontSize: "16px" }}>
              오른스푼 공식 채널을 구독하시면 최신 영상과 깊이 있는 분석을 가장 먼저 받아보실 수 있습니다.
            </p>
            <div className={styles.cta__actions}>
              <a href="https://youtube.com/channel/UCzoap467OGtjhLk5qmU53OA?si=qKPByMpqOz1bq44J" target="_blank" rel="noopener noreferrer" className="btn btn--primary" style={{ padding: "12px 24px", fontSize: "16px", borderRadius: "30px", background: "#FF0000" }}>
                ▶ 유튜브 채널 구독하기
              </a>
              <Link href="/about" className="btn btn--outline" style={{ padding: "12px 24px", fontSize: "16px", borderRadius: "30px", color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
                사이트 소개
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
