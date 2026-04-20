import Header from "./components/Header";
import Footer from "./components/Footer";
import { ArticleCard, HeroArticle } from "./components/ArticleCard";
import AdSlot from "./components/AdSlot";
import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

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
    const match = id.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : id.replace(/[\/\\?#]+$/, '');
  };

  // Helper: HTML 태그 제거 (Rich Editor content에서 excerpt 추출)
  const stripHtml = (html: string) => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';

  // 데이터 포맷팅 (DB -> 컴포넌트 프롭스 구조)
  const formattedArticles = dbArticles.map((a) => ({
    id: a.id,
    title: a.title,
    excerpt: stripHtml(typeof a.content === 'string' ? a.content : '').substring(0, 100) + '...',
    category: (a.category === "정치" ? "politics" : "economy") as "politics" | "economy",
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
          <span className={styles.ticker__label}>속보</span>
          <span className={styles.ticker__text}>
            올바른 생각만 떠먹여 드립니다. 대한민국 보수 시각의 뉴스와 칼럼을 매일 전합니다. &nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;
          </span>
          <span className={styles.ticker__text}>
            올바른 생각만 떠먹여 드립니다. 대한민국 보수 시각의 뉴스와 칼럼을 매일 전합니다. &nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className={styles["hero-section"]}>
        <HeroArticle article={heroArticle} />
      </section>

      {/* Main Stream Ad Block */}
      <div className="container">
        <AdSlot format="auto" />
      </div>

      {/* Latest Articles */}
      <section className={styles.section}>
        <div className={styles.section__header}>
          <h2 className={styles.section__title}>
            <span className={styles["section__title-accent"]} />
            최신 콘텐츠
          </h2>
          <Link href="/category/all" className={styles.section__more}>
            전체보기 →
          </Link>
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
        </div>

        {/* Articles Grid */}
        <div className={`${styles.grid} stagger`}>
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Join CTA */}
      <section className={styles.cta}>
        <div className={styles.cta__inner}>
          <h2 className={styles.cta__title}>
            오른스푼과 함께하세요
          </h2>
          <p className={styles.cta__desc}>
            같은 가치관을 가진 사람들과 소통하고, 깊이 있는 콘텐츠를 먼저
            만나보세요.
          </p>
          <div className={styles.cta__actions}>
            <Link href="/about" className="btn btn--outline">
              더 알아보기
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
