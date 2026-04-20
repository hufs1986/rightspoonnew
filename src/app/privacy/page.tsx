import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../category/[slug]/page.module.css"; // category header styles 재사용

export const metadata = {
    title: "개인정보처리방침 | 오른스푼",
};

export default function PrivacyPolicyPage() {
    return (
        <div className={styles.main}>
            <Header />

            <div className={styles.categoryHeader}>
                <div className={styles.categoryContainer}>
                    <h1 className={styles.categoryTitle}>개인정보처리방침</h1>
                    <p className={styles.categoryDesc}>
                        오른스푼 미디어의 개인정보 보호 정책을 안내해 드립니다.
                    </p>
                </div>
            </div>

            <section className="container" style={{ padding: "80px 20px" }}>
                <article style={{ maxWidth: 800, margin: "0 auto", lineHeight: 1.8 }}>
                    <p style={{ marginBottom: 24 }}>
                        오른스푼(이하 "회사" 또는 "사이트")은 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같은 개인정보처리방침을 수립·공개합니다.
                    </p>

                    <h3 style={{ marginTop: 32, marginBottom: 16 }}>1. 개인정보의 처리 목적</h3>
                    <p style={{ marginBottom: 24 }}>
                        회사는 다음의 목적을 위해 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.<br />
                        - 서비스 제공 (콘텐츠 열람 등)<br />
                        - 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계<br />
                        - 광고(구글 애드센스 등) 식별자를 통한 맞춤형 광고 제공
                    </p>

                    <h3 style={{ marginTop: 32, marginBottom: 16 }}>2. 수집하는 개인정보 항목 (현재 수집 안함)</h3>
                    <p style={{ marginBottom: 24 }}>
                        회사는 현재 별도의 회원가입 절차를 운영하지 않으므로 회원 개인을 식별할 수 있는 (이름, 전화번호 등) 민감한 개인정보를 직접 수집하지 않습니다. 단, 서비스 이용 과정에서 아래와 같은 정보들이 자동으로 생성되어 수집될 수 있습니다.<br />
                        - 접속 IP 정보, 쿠키(Cookie), 서비스 이용 기록, 접속 로그, MAC 주소
                    </p>

                    <h3 style={{ marginTop: 32, marginBottom: 16 }}>3. 타사 쿠키 및 구글 애드센스</h3>
                    <p style={{ marginBottom: 24 }}>
                        본 사이트는 구글 애드센스 광고를 게재합니다. 구글 및 기타 제3자 공급업체는 쿠키를 사용하여 사용자가 이 사이트나 다른 वेबसाइट에 이전에 방문한 정보를 기반으로 광고를 게재할 수 있습니다.<br />
                        사용자는 구글 광고 설정 페이지를 방문하여 맞춤형 광고를 위한 쿠키 사용을 거부할 수 있습니다.
                    </p>

                    <h3 style={{ marginTop: 32, marginBottom: 16 }}>4. 개인정보의 파기</h3>
                    <p style={{ marginBottom: 24 }}>
                        회사는 원칙적으로 개인정보 처리 목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. (현재 자동 수집되는 로그 정보 이외에는 보유하고 있지 않습니다.)
                    </p>
                </article>
            </section>

            <Footer />
        </div>
    );
}
