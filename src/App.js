import Search from "./components/search/Search";
import CurrentWeather from "./components/currentWeather/CurrentWeather";
import useFetchWeather from "./hooks/useFetchWeather";
import { useEffect, useState } from "react";
import Forecast from "./components/forecast/Forecast";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./global.css";
import SkeletonCard from "./components/ui/SkeletonCard";
import Header from "./components/layout/Header";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const { fetchWeather, error, loading } = useFetchWeather();
  const [lastSearch, setLastSearch] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem("units");
    return saved === "imperial" ? "imperial" : "metric";
  });
  const unitSymbol = units === "imperial" ? "°F" : "°C";

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);


  const handleOnSearchChange = async (searchData, unitsOverride = units) => {
    const [lat, lon] = searchData?.value?.split(" ") || [];
    if (!lat || !lon) {
      return;
    };

    setLastSearch(searchData);

    const response = await fetchWeather(lat, lon, unitsOverride);

    if (response.error) {
      toast.error(response.error, { position: "top-right" });
      return;
    };

    const resolvedCity =
      searchData?.label ||
      response.currentWeather?.name ||
      "Current location";
    toast.success(`Weather data for ${resolvedCity} loaded successfully!`, { position: "top-right" });
    setCurrentWeather({ city: resolvedCity, ...response.currentWeather });
    setForecast({ city: resolvedCity, ...response.forecast });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.", { position: "top-right" });
      return;
    }
    const onSuccess = async (pos) => {
      const { latitude, longitude } = pos.coords;
      const response = await fetchWeather(latitude, longitude, units);
      if (response.error) {
        toast.error(response.error, { position: "top-right" });
        return;
      }
      const resolvedCity = response.currentWeather?.name || "Current location";
      toast.success(`Weather data for ${resolvedCity} loaded successfully!`, { position: "top-right" });
      setCurrentWeather({ city: resolvedCity, ...response.currentWeather });
      setForecast({ city: resolvedCity, ...response.forecast });
      setLastSearch({ value: `${latitude} ${longitude}`, label: resolvedCity });
    };

    const onError = (err, triedHighAccuracy = false) => {
      console.error("Geolocation error:", err);
      if (!triedHighAccuracy) {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (e) => onError(e, true),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
        return;
      }
      const msg =
        err.code === err.PERMISSION_DENIED
          ? "Location permission denied."
          : err.code === err.POSITION_UNAVAILABLE
            ? "Location unavailable."
            : err.code === err.TIMEOUT
              ? "Getting your location timed out."
              : "Failed to get your location.";
      toast.error(msg, { position: "top-right" });
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (e) => onError(e, false),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 600000 }
    );
  };

  const toggleUnits = () => {
    const next = units === "metric" ? "imperial" : "metric";
    setUnits(next);
    localStorage.setItem("units", next);
    if (lastSearch?.value) {
      handleOnSearchChange(lastSearch, next);
    } else if (currentWeather?.coord) {
      const { lat, lon } = currentWeather.coord;
      fetchWeather(lat, lon, next).then((response) => {
        if (!response?.error) {
          const resolvedCity = response.currentWeather?.name || currentWeather?.city || "Current location";
          setCurrentWeather({ city: resolvedCity, ...response.currentWeather });
          setForecast({ city: resolvedCity, ...response.forecast });
        }
      });
    }
  };

  return (
    <div className="container">
      <ToastContainer autoClose={4000} hideProgressBar closeOnClick />
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="main_content">
        <section>
          <Search onSearchChange={handleOnSearchChange} />
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
            <button className="retry_button" onClick={handleUseMyLocation} aria-label="Use my location">
              Use my location
            </button>
            <button
              className="retry_button"
              onClick={toggleUnits}
              aria-pressed={units === "imperial"}
              aria-label="Toggle units"
              title={`Switch to ${units === "metric" ? "°F / mph" : "°C / m/s"}`}
            >
              {units === "metric" ? "°C / m/s" : "°F / mph"}
            </button>
          </div>
        </section>

        {!currentWeather && !forecast && !error && (
          <p className="fallback_message">Search for a city to view the weather.</p>
        )}

        {error && (
          <div className="error_message">
            <p>{error}</p>
            {lastSearch && (
              <button className="retry_button" onClick={() => handleOnSearchChange(lastSearch)}>
                Retry
              </button>
            )}
          </div>
        )}

        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        <section style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {currentWeather && <CurrentWeather data={currentWeather} unitSymbol={unitSymbol} units={units} />}
          {forecast && (
            <div className="forecast__grid">
              <Forecast data={forecast} unitSymbol={unitSymbol} units={units} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;