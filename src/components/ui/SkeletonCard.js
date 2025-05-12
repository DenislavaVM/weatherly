import styles from "./SkeletonCard.module.css";

const SkeletonCard = () => {
    return (
        <div className={styles.skeleton}>
            <div className={styles.title}></div>
            <div className={styles.line}></div>
            <div className={styles.line}></div>
            <div className={styles.line}></div>
        </div>
    );
};

export default SkeletonCard;