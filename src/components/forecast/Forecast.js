import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import styles from "./Forecast.module.css";

const Forecast = ({ data }) => {
    const [openIndex, setOpenIndex] = useState(null);

    if (!data || !data.list || !Array.isArray(data.list)) {
        return <p className="error_message">Forecast data unavailable.</p>;
    }

    const grouped = data.list.reduce((acc, entry) => {
        const dateKey = format(parseISO(entry.dt_txt), "yyyy-MM-dd");
        (acc[dateKey] ||= []).push(entry);
        return acc;
    }, {});

    const dailyForecasts = Object.entries(grouped)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([date, items]) => {
            const min = Math.min(...items.map(i => i.main.temp_min));
            const max = Math.max(...items.map(i => i.main.temp_max));
            const noon =
                items.find(i => i.dt_txt.includes("12:00:00")) ||
                items[Math.floor(items.length / 2)];
            return { date, item: noon, min, max };
        })
        .slice(0, 5);

    const toggleDetails = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <>
            <label className={styles.forecast__title}>5-Day Forecast</label>
            <div className={styles.forecast__grid_desktop}>
                {dailyForecasts.map(({ date, item, min, max }, index) => (
                    <div
                        key={date}
                        className={`${styles.forecast__list_item} ${openIndex === index ? styles.active : ""}`}
                        onClick={() => toggleDetails(index)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleDetails(index);
                            }
                        }}
                        role="button"
                        aria-expanded={openIndex === index}
                        aria-pressed={openIndex === index}
                        aria-controls={`forecast-details-${index}`}
                        aria-label={`Toggle forecast details for ${format(parseISO(item.dt_txt), "EEEE, MMM d")}`}
                        tabIndex={0}
                    >
                        <div className={styles.forecast__compact}>
                            <img
                                alt={`Weather icon showing ${item.weather[0].description}`}
                                className={styles.forecast__icon_small}
                                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                            />
                            <span className={styles.forecast__day}>
                                {format(parseISO(item.dt_txt), "EEEE, MMM d")}
                            </span>
                            <span className={styles.forecast__temperature_range}>
                                {Math.round(min)}°C / {Math.round(max)}°C
                            </span>
                            <span className={styles.forecast__toggle_icon}>
                                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                        </div>

                        {openIndex === index && (
                            <div
                                id={`forecast-details-${index}`}
                                className={styles.forecast__details_grid}
                            >
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
                                    <label>{item.main.sea_level || "N/A"} m</label>
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
