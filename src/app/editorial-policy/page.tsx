import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../about/about.module.css";

export const metadata = {
    title: "편집 원칙 | 오른스푼",
    description: "오른스푼의 콘텐츠 작성 기준, AI 활용 원칙, 정정 및 문의 절차를 안내합니다.",
};

export default function EditorialPolicyPage() {
    return (
        <div className={styles.main}>
            <Header />

            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroIdentity}>
                        <img src="/logo-character.webp" alt="드럼통119" className={styles.heroLogo} />
                        <span>오른스푼 운영 기준</span>
                    </div>
                    <h1 className={styles.heroTitle}>
                        오른스푼은 빠른 복사가 아니라, 남는 해설을 목표로 씁니다.
                    </h1>
                    <p className={styles.heroDesc}>
                        정치·사회 이슈를 다루는 1인 미디어일수록 관점, 근거, 책임 소재가 분명해야 합니다.
                        이 페이지는 오른스푼이 글을 고르고, 쓰고, 고치는 기준을 공개합니다.
                    </p>
                </div>
            </section>

            <section className={styles.content}>
                <section className={styles.statement}>
                    <p className={styles.kicker}>Editorial Policy</p>
                    <h2>무엇을 쓰는가</h2>
                    <p>
                        오른스푼은 인스타그램과 유튜브에서 빠르게 지나가는 정치·사회 이슈 중
                        다시 꺼내 읽을 가치가 있는 주제를 글로 정리합니다. 속보 경쟁보다 사건의 구조,
                        반복되는 프레임, 독자가 확인해야 할 질문을 남기는 데 집중합니다.
                    </p>
                </section>

                <div className={styles.grid}>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>01</span>
                        <h3 className={styles.cardTitle}>뉴스 원문을 베끼지 않습니다</h3>
                        <p className={styles.cardDesc}>
                            공개된 기사나 자료를 참고하더라도 문장과 구성을 그대로 옮기지 않습니다.
                            필요한 경우 출처 링크를 남기고, 오른스푼의 해석과 결론을 별도로 작성합니다.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>02</span>
                        <h3 className={styles.cardTitle}>AI는 초안 보조 도구입니다</h3>
                        <p className={styles.cardDesc}>
                            AI는 소재 정리, 리라이트 구조, 인스타 공유 문구 생성에 사용합니다.
                            최종 발행 전에는 운영자가 문체, 사실관계, 출처, 결론을 확인합니다.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>03</span>
                        <h3 className={styles.cardTitle}>관점은 숨기지 않습니다</h3>
                        <p className={styles.cardDesc}>
                            오른스푼은 오른쪽 시각의 해설 미디어입니다. 관점을 감추지 않는 대신,
                            독자가 판단할 수 있도록 쟁점과 반대 프레임을 함께 정리하려고 합니다.
                        </p>
                    </div>
                </div>

                <section className={styles.readGuide}>
                    <div>
                        <p className={styles.kicker}>Corrections</p>
                        <h2>정정과 문의</h2>
                    </div>
                    <div className={styles.guideList}>
                        <div>
                            <strong>사실관계 오류</strong>
                            <span>확인 가능한 오류가 있으면 내용을 검토한 뒤 수정하거나 보충 문구를 반영합니다.</span>
                        </div>
                        <div>
                            <strong>출처 보강</strong>
                            <span>기존 글도 콘텐츠 감사와 AI 리라이트 도구를 통해 출처, 소제목, 내부 링크를 계속 보강합니다.</span>
                        </div>
                        <div>
                            <strong>문의</strong>
                            <span>제보, 정정 요청, 협업 문의는 이메일로 받습니다.</span>
                        </div>
                    </div>
                </section>

                <section className={styles.contact}>
                    <p>정정 요청 및 제보</p>
                    <a href="mailto:drumtong119@gmail.com">drumtong119@gmail.com</a>
                    <div style={{ marginTop: 16 }}>
                        <Link href="/about" className={styles.channelLink}>
                            운영자 소개 보기
                        </Link>
                    </div>
                </section>
            </section>

            <Footer />
        </div>
    );
}
