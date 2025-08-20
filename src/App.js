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

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);


  const handleOnSearchChange = async (searchData) => {
    const [lat, lon] = searchData?.value?.split(" ") || [];
    if (!lat || !lon) {
      return;
    };

    setLastSearch(searchData);

    const response = await fetchWeather(lat, lon);

    if (response.error) {
      toast.error(response.error, { position: "top-right" });
      return;
    };

    toast.success(`Weather data for ${searchData.label} loaded successfully!`, { position: "top-right" });
    setCurrentWeather({ city: searchData.label, ...response.currentWeather });
    setForecast({ city: searchData.label, ...response.forecast });
  };

  return (
    <div className="container">
      <ToastContainer autoClose={4000} hideProgressBar closeOnClick />
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="main_content">
        <section>
          <Search onSearchChange={handleOnSearchChange} />
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
          {currentWeather && <CurrentWeather data={currentWeather} />}
          {forecast && (
            <div className="forecast__grid">
              <Forecast data={forecast} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;