import styles from "./Spinner.module.css";

const Spinner = () => {
    return (
        <div
            className={styles.spinner__overlay}
            role="status"
            aria-label="Loading"
        >
            <div className={styles.spinner__circle}></div>
        </div>
    );
};

export default Spinner;