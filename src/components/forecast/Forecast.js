import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import icons
import styles from "./Forecast.module.css";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Forecast = ({ data }) => {
    const [openIndex, setOpenIndex] = useState(null);

    if (!data || !data.list || !Array.isArray(data.list)) {
        return <p className="error_message">Forecast data unavailable.</p>;
    }

    const dayInWeek = new Date().getDay();
    const forecastDays = WEEK_DAYS.slice(dayInWeek, WEEK_DAYS.length).concat(WEEK_DAYS.slice(0, dayInWeek));

    const toggleDetails = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <>
            <label className={styles.forecast__title}>7-Day Forecast</label>
            <div className={styles.forecast__grid_desktop}>
                {data.list.slice(0, 7).map((item, index) => (
                    <div
                        key={index}
                        className={`${styles.forecast__list_item} ${openIndex === index ? styles.active : ""}`}
                        onClick={() => toggleDetails(index)}
                    >
                        <div className={styles.forecast__compact}>
                            <img
                                alt="weather"
                                className={styles.forecast__icon_small}
                                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                            />
                            <span className={styles.forecast__day}>{forecastDays[index]}</span>
                            <span className={styles.forecast__temperature_range}>
                                {Math.round(item.main.temp_min)}°C / {Math.round(item.main.temp_max)}°C
                            </span>
                            <span className={styles.forecast__toggle_icon}>
                                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                        </div>

                        {openIndex === index && (
                            <div className={styles.forecast__details_grid}>
                                <div className={styles.forecast__details_item}>
                                    <label>Pressure:</label>
                                    <label>{item.main.pressure} hPa</label>
                                </div>
                                <div className={styles.forecast__details_item}>
                                    <label>Humidity:</label>
                                    <label>{item.main.humidity}%</label>
                                </div>
                                <div className={styles.forecast__details_item}>
                                    <label>Clouds:</label>
                                    <label>{item.clouds.all}%</label>
                                </div>
                                <div className={styles.forecast__details_item}>
                                    <label>Wind Speed:</label>
                                    <label>{item.wind.speed} m/s</label>
                                </div>
                                <div className={styles.forecast__details_item}>
                                    <label>Sea Level:</label>
                                    <label>{item.main.sea_level || 'N/A'} m</label>
                                </div>
                                <div className={styles.forecast__details_item}>
                                    <label>Feels Like:</label>
                                    <label>{Math.round(item.main.feels_like)}°C</label>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Forecast;
