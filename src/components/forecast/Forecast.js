import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { format, parse } from "date-fns";
import styles from "./Forecast.module.css";

const Forecast = ({ data, unitSymbol = "°C", units = "metric" }) => {
    const [openIndex, setOpenIndex] = useState(null);
    const toDate = (s) => {
        const d = parse(s, "yyyy-MM-dd HH:mm:ss", new Date());
        return Number.isNaN(d.getTime()) ? new Date(s.replace(" ", "T")) : d;
    };

    if (!data || !data.list || !Array.isArray(data.list)) {
        return <p className="error_message">Forecast data unavailable.</p>;
    }

    const grouped = data.list.reduce((acc, entry) => {
        const dateKey = format(toDate(entry.dt_txt), "yyyy-MM-dd");
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
                {dailyForecasts.map(({ date, item, min, max }, index) => {
                    const when = toDate(item.dt_txt);
                    const dayLabel = format(when, "EEEE, MMM d");
                    return (
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
                            aria-label={`Toggle forecast details for ${dayLabel}`}
                            tabIndex={0}
                        >
                            <div className={styles.forecast__compact}>
                                <img
                                    alt={`Weather icon showing ${item.weather?.[0]?.description ?? "conditions"}`}
                                    className={styles.forecast__icon_small}
                                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                    loading="lazy"
                                />
                                <span className={styles.forecast__day}>
                                    {dayLabel}
                                </span>
                                <span className={styles.forecast__temperature_range}>
                                    {Math.round(min)}{unitSymbol} / {Math.round(max)}{unitSymbol}
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
                                        <label>
                                            {item.wind.speed} {units === "imperial" ? "mph" : "m/s"}
                                        </label>
                                    </div>
                                    <div className={styles.forecast__details_item}>
                                        <label>Sea Level:</label>
                                        <label>{item.main.sea_level != null ? `${item.main.sea_level} m` : "N/A"}</label>
                                    </div>
                                    <div className={styles.forecast__details_item}>
                                        <label>Feels Like:</label>
                                        <label>{Math.round(item.main.feels_like)}{unitSymbol}</label>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default Forecast;
