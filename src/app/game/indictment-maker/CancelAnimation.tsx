import styles from "./game.module.css";

export default function CancelAnimation() {
    return (
        <div className={styles.gameContainer}>
            <div className={styles.cancelOverlay}>
                <div className={styles.cancelText}>재판이 종료되었습니다.</div>
                <div className={styles.cancelSubText}>
                    유무죄 판단 없음.
                    <br />
                    증거조사 없음.
                    <br />
                    판결 없음.
                    <br />
                    <br />
                    공소가 사라졌습니다.
                </div>
            </div>
        </div>
    );
}

