import styles from "./Header.module.css";
import { FaCloudSun } from "react-icons/fa";
import ThemeToggle from "../ui/ThemeToggle";

const Header = ({ darkMode, toggleDarkMode }) => {
    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <FaCloudSun className={styles.logo} />
                <div className={styles.text_group}>
                    <h1 className={styles.title}>Weatherly</h1>
                    <p className={styles.subtitle}>Your global weather companion</p>
                </div>
            </div>
            <div className={styles.themeWrapper}>
                <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </div>
        </header>
    );
};

export default Header;