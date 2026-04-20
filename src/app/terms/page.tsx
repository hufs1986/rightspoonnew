import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../category/[slug]/page.module.css";

export const metadata = {
    title: "이용약관 | 오른스푼",
};

export default function TermsPage() {
    return (
        <div className={styles.main}>
            <Header />

            <div className={styles.categoryHeader}>
                <div className={styles.categoryContainer}>
                    <h1 className={styles.categoryTitle}>이용약관</h1>
                    <p className={styles.categoryDesc}>
                        오른스푼 미디어 서비스 이용에 대한 기본 약관입니다.
                    </p>
                </div>
            </div>

            <section className="container" style={{ padding: "80px 20px" }}>
                <article style={{ maxWidth: 800, margin: "0 auto", lineHeight: 1.8 }}>
                    <p style={{ marginBottom: 24 }}>
                        본 약관은 오른스푼(이하 "회사"라 함)이 제공하는 미디어 및 기타 관련 서비스(이하 "서비스"라 함)의 이용과 관련하여 회사와 회원(비회원을 포함)과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                    </p>

                    <h3 style={{ marginTop: 32, marginBottom: 16 }}>제 1조. 서비스의 제공</h3>
                    <p style={{ marginBottom: 24 }}>
                        1. 회사는 이용자에게 뉴스 칼럼, 유튜브 영상 링크 공유, 미디어 콘텐츠 열람 등의 서비스를 무상으로 제공합니다.<br />
                        2. 서비스의 내용, 이용 방법, 이용 시간에 대하여 변경 사항이 있는 경우에는 변경 사유 및 내용을 사이트에 사전 공지합니다.
                    </p>

                    <h3 style={{ marginTop: 32, marginBottom: 16 }}>제 2조. 저작권의 귀속 및 이용제한</h3>
                    <p style={{ marginBottom: 24 }}>
                        1. 회사가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 원칙적으로 회사에 귀속됩니다. 단, 유튜브 영상 등 제3자의 저작물은 해당 플랫폼의 정책 및 원저작권자의 권리를 따릅니다.<br />
                        2. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
                    </p>

                    <h3 style={{ marginTop: 32, marginBottom: 16 }}>제 3조. 이용자의 의무</h3>
                    <p style={{ marginBottom: 24 }}>
                        1. 이용자는 법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.<br />
                        2. 향후 댓글 등 사용자 참여 기능 오픈 시, 이용자는 타인의 명예를 훼손하거나 모욕하는 행위, 욕설, 음란물 등 불법적인 게시물을 작성해서는 안 됩니다.
                    </p>

                    <h3 style={{ marginTop: 32, marginBottom: 16 }}>제 4조. 면책 조항</h3>
                    <p style={{ marginBottom: 24 }}>
                        1. 회사는 천재지변 등 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.<br />
                        2. 회사는 인터넷망 등의 문제 등 통신 설비 장애로 서비스가 중지되는 경우에 대하여 책임을 지지 않습니다.<br />
                        3. 본 사이트는 유튜브 등 외부 플랫폼의 콘텐츠 링크를 포함할 수 있으며, 해당 외부 사이트의 내용이나 신뢰도에 대해서는 책임을 지지 않습니다.
                    </p>
                </article>
            </section>

            <Footer />
        </div>
    );
}
