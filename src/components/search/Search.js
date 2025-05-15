import { useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { fetchCities } from "../../api/geoApi";
import styles from "./Search.module.css";
import Spinner from "../ui/Spinner";

const customStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: "var(--secondary-bg)",
        color: "var(--text-color)",
        borderColor: state.isFocused ? "var(--accent-color)" : "var(--text-secondary)",
        boxShadow: state.isFocused ? "0 0 0 2px var(--accent-color)" : "none",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "var(--secondary-bg)",
        color: "var(--text-color)",
        zIndex: 100,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "rgba(30, 144, 255, 0.1)" : "transparent",
        color: "var(--text-color)",
        cursor: "pointer",
    }),
    input: (base) => ({
        ...base,
        color: "var(--text-color)",
    }),
    singleValue: (base) => ({
        ...base,
        color: "var(--text-color)",
    }),
    placeholder: (base) => ({
        ...base,
        color: "var(--text-secondary)",
    }),
};

const Search = ({ onSearchChange }) => {
    const [search, setSearch] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadOptions = async (inputValue) => {
        if (!inputValue.trim()) {
            return { options: [] };
        }

        setLoading(true);
        setError(null);

        try {
            const cities = await fetchCities(inputValue);
            return {
                options: cities.map((city) => ({
                    value: city.latitude ? `${city.latitude} ${city.longitude}` : "",
                    label: `${city.name}, ${city.countryCode}`,
                    isDisabled: city.name === "No Cities Found",
                })),
            };

        } catch (error) {
            console.error("Error loading options:", error);
            setError("Failed to load city data. Please try again.");
            return { options: [] };
        } finally {
            setLoading(false);
        }
    };

    const handleOnChange = (searchData) => {
        if (!searchData) {
            return;
        };

        setError(null);
        setSearch(searchData);
        onSearchChange(searchData);
    };

    return (
        <div className={styles.search_container}>
            <AsyncPaginate
                className={styles.search_input}
                placeholder="Search for a city"
                debounceTimeout={300}
                value={search}
                onChange={handleOnChange}
                loadOptions={loadOptions}
                noOptionsMessage={() => "No cities found"}
                aria-label="Search for a city"
                styles={customStyles}
            />

            {loading && <Spinner />}
            {error && <div className="error_message">{error}</div>}
        </div>
    );
};

export default Search;