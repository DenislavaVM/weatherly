import styles from "./CurrentWeather.module.css";

const CurrentWeather = ({ data }) => {

    if (!data || !data.weather || !data.weather[0]) {
        return <p className="error_message">Weather data unavailable.</p>;
    }

    return (
        <div className={styles.weather}>
            <div className={styles.weather__top}>
                <div>
                    <p className={styles.weather__city}>{data.city}</p>
                    <p className={styles.weather__description}>{data.weather[0].description}</p>
                </div>
                <img
                    alt="weather"
                    className={styles.weather__icon}
                    src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                />
            </div>
            <div className={styles.weather__bottom}>
                <p className="weather__temperature">{Math.round(data.main.temp)}°C</p>
                <div className={styles.weather__details}>
                    <div className={styles.weather__details_row}>
                        <span className={styles.weather__details_label}>Details:</span>
                    </div>
                    <div className={styles.weather__details_row}>
                        <span className={styles.weather__details_label}>Feels like:</span>
                        <span className={styles.weather__details_value}>{Math.round(data.main.feels_like)}°C</span>
                    </div>
                    <div className={styles.weather__details_row}>
                        <span className={styles.weather__details_label}>Wind:</span>
                        <span className={styles.weather__details_value}>{data.wind.speed} m/s</span>
                    </div>
                    <div className={styles.weather__details_row}>
                        <span className={styles.weather__details_label}>Humidity:</span>
                        <span className={styles.weather__details_value}>{data.main.humidity}%</span>
                    </div>
                    <div className={styles.weather__details_row}>
                        <span className={styles.weather__details_label}>Pressure:</span>
                        <span className={styles.weather__details_value}>{data.main.pressure} hPa</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentWeather;