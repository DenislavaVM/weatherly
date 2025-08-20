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
    return localStorage.getItem("units") || "metric";
  });
  const unitSymbol = units === "imperial" ? "°F" : "°C";

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      newMode ? "dark" : "light"
    );
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const handleOnSearchChange = async (searchData, unitsOverride = units) => {
    const [lat, lon] = searchData?.value?.split(" ") || [];
    if (!lat || !lon) {
      return;
    }

    setLastSearch(searchData);

    const response = await fetchWeather(lat, lon, unitsOverride);

    if (response.error) {
      toast.error(response.error, { position: "top-right" });
      return;
    }

    const resolvedCity =
      searchData?.label || response.currentWeather?.name || "Current location";

    toast.success(
      `Weather data for ${resolvedCity} loaded successfully!`,
      { position: "top-right" }
    );
    setCurrentWeather({ city: resolvedCity, ...response.currentWeather });
    setForecast({ city: resolvedCity, ...response.forecast });
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
          const resolvedCity =
            response.currentWeather?.name ||
            currentWeather?.city ||
            "Current location";
          setCurrentWeather({
            city: resolvedCity,
            ...response.currentWeather,
          });
          setForecast({ city: resolvedCity, ...response.forecast });
        }
      });
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.", { position: "top-right" });
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      toast.error("Geolocation requires HTTPS. Open the site over https://", { position: "top-right" });
      return;
    }

    let settled = false;
    let ipTried = false;
    let hiAccTried = false;

    const finishWithCoords = async (coords, source) => {
      if (settled) return;
      settled = true;

      const { latitude, longitude } = coords;
      console.log(`[geo] using coords from ${source}:`, { latitude, longitude });

      const response = await fetchWeather(latitude, longitude, units);
      if (response?.error) {
        toast.error(response.error, { position: "top-right" });
        return;
      }

      const resolvedCity = response.currentWeather?.name || "Current location";
      toast.success(`Weather data for ${resolvedCity} loaded successfully!`, { position: "top-right" });
      setCurrentWeather({ city: resolvedCity, ...response.currentWeather });
      setForecast({ city: resolvedCity, ...response.forecast });
      setLastSearch({ value: `${latitude} ${longitude}`, label: resolvedCity });
    };

    const ipFallback = async () => {
      if (settled || ipTried) return;
      ipTried = true;
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          toast.info("Using approximate location (by IP).", { position: "top-right" });
          return finishWithCoords({ latitude: data.latitude, longitude: data.longitude }, "ip");
        }
      } catch (e) {
        console.warn("[geo] IP fallback failed:", e);
      }
      if (!settled) {
        toast.error("Location unavailable. You can search for a city instead.", { position: "top-right" });
      }
    };

    const tryHighAccuracy = () => {
      if (settled || hiAccTried) return;
      hiAccTried = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => finishWithCoords(pos.coords, "device-hiacc"),
        (err) => {
          console.error("[geo] high-accuracy failed:", { code: err?.code, message: err?.message || "" });
          ipFallback();
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    };

    const onCoarseError = (err) => {
      console.error("Geolocation error (coarse):", { code: err?.code, message: err?.message || "" });
      tryHighAccuracy();
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => finishWithCoords(pos.coords, "device-coarse"),
      onCoarseError,
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }
    );

    setTimeout(() => {
      if (!settled) ipFallback();
    }, 25000);
  };

  return (
    <div className="container">
      <ToastContainer autoClose={4000} hideProgressBar closeOnClick />
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="main_content">
        <section>
          <Search onSearchChange={handleOnSearchChange} />
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button className="retry_button" onClick={handleUseMyLocation}>
              Use my location
            </button>
            <button
              className="retry_button"
              onClick={toggleUnits}
              aria-pressed={units === "imperial"}
              aria-label="Toggle units"
              title={`Switch to ${units === "metric" ? "°F / mph" : "°C / m/s"}`}
            >
              Switch to {units === "metric" ? "°F / mph" : "°C / m/s"}
            </button>
          </div>
        </section>

        {!currentWeather && !forecast && !error && (
          <p className="fallback_message">
            Search for a city to view the weather.
          </p>
        )}

        {error && (
          <div className="error_message">
            <p>{error}</p>
            {lastSearch && (
              <button
                className="retry_button"
                onClick={() => handleOnSearchChange(lastSearch)}
              >
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

        <section
          style={{ display: "flex", flexDirection: "column", gap: "30px" }}
        >
          {currentWeather && (
            <CurrentWeather
              data={currentWeather}
              units={units}
              unitSymbol={unitSymbol}
            />
          )}
          {forecast && (
            <div className="forecast__grid">
              <Forecast
                data={forecast}
                units={units}
                unitSymbol={unitSymbol}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;