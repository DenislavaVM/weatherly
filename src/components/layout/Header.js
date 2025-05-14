import styles from "./Header.module.css";
import { FaCloudSun } from "react-icons/fa";

const Header = () => {
    return (
        <header className={styles.header}>
            <FaCloudSun className={styles.logo} />
            <div className={styles.text_group}>
                <h1 className={styles.title}>Weatherly</h1>
                <p className={styles.subtitle}>Your global weather companion</p>
            </div>
        </header>
    );
};

export default Header;