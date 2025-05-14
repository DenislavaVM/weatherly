import { FaSun, FaMoon } from "react-icons/fa";
import styles from "./ThemeToggle.module.css";

const ThemeToggle = ({ darkMode, toggleDarkMode }) => (
    <button className={styles.theme_toggle} onClick={toggleDarkMode}>
        {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        {darkMode ? " Light Mode" : " Dark Mode"}
    </button>
);

export default ThemeToggle;