import Header from "./components/Header";
import Footer from "./components/Footer";
import { ArticleCard, HeroArticle } from "./components/ArticleCard";
import { mockArticles } from "./data/articles";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  const heroArticle = mockArticles[0];
  const latestArticles = mockArticles.slice(1);

  return (
    <div className={styles.main}>
      <Header />

      {/* Breaking News Ticker */}
      <div className={styles.ticker}>
        <div className={styles.ticker__inner}>
          <span className={styles.ticker__label}>속보</span>
          <span className={styles.ticker__text}>
            오른스푼 미디어 사이트가 새롭게 리뉴얼되었습니다! 보수 시각의 깊이
            있는 분석을 매일 전합니다. — 회원 가입 신청을 통해 댓글 기능을
            이용하세요.
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
          <Link href="/category/all" className={styles.section__more}>
            전체보기 →
          </Link>
        </div>

        {/* Category Filter */}
        <div className={styles.filter}>
          <button
            className={`${styles.filter__btn} ${styles["filter__btn--active"]}`}
          >
            전체
          </button>
          <button className={styles.filter__btn}>정치</button>
          <button className={styles.filter__btn}>경제</button>
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
            <br />
            인스타 1.7만 · 유튜브 1.5만 · 틱톡 1.6만 팔로워가 함께합니다.
          </p>
          <div className={styles.cta__actions}>
            <Link href="/register" className="btn btn--primary">
              회원 가입 신청
            </Link>
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
