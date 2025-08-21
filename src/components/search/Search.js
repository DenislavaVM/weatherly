import { useState, useRef } from "react";
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
        borderRadius: "8px",
        padding: "2px 4px",
        transition: "all 0.2s ease-in-out",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "var(--secondary-bg)",
        color: "var(--text-color)",
        zIndex: 100,
        borderRadius: "10px",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.25)",
        marginTop: "8px",
        width: "100%",
        left: "50%",
        transform: "translateX(-50%)",
    }),
    menuList: (base) => ({
        ...base,
        padding: 0,
        maxHeight: "250px",
        overflowY: "auto",
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "rgba(30, 144, 255, 0.15)" : "transparent",
        color: "var(--text-color)",
        padding: "12px 16px",
        fontSize: "0.95rem",
        transition: "background 0.2s ease-in-out",
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
    const [AsyncPaginate, setAsyncPaginate] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const inputRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const controllerRef = useRef(null);

    const loadAsync = async () => {
        if (!AsyncPaginate) {
            const m = await import("react-select-async-paginate");
            setAsyncPaginate(() => m.AsyncPaginate);
        };
        setMenuOpen(true);
    };

    const loadOptions = async (inputValue) => {
        if (!inputValue.trim() || inputValue.trim().length < 2) {
            controllerRef.current?.abort();
            return { options: [] };
        };

        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const cities = await fetchCities(inputValue, controller.signal);
            if (controllerRef.current !== controller) {
                return { options: [] };
            };

            return {
                options: cities.map((city) => ({
                    value: city.latitude ? `${city.latitude} ${city.longitude}` : "",
                    label: `${city.name}, ${city.countryCode}`,
                    isDisabled: city.name === "No Cities Found",
                })),
            };
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("Error loading options:", err);
                setError("Failed to load city data. Please try again.");
            };
            return { options: [] };
        } finally {
            if (controllerRef.current === controller) {
                setLoading(false);
            };
        };
    };

    const handleOnChange = (searchData) => {
        if (!searchData) {
            setSearch(null);
            onSearchChange(null);
            return;
        };

        setError(null);
        setSearch(searchData);
        onSearchChange(searchData);
        setMenuOpen(false);
    };

    return (
        <div className={styles.search_container}>
            {!AsyncPaginate ? (
                <input
                    ref={inputRef}
                    className={styles.search_input}
                    placeholder="Search for a city"
                    onFocus={loadAsync}
                    onInput={loadAsync}
                    onBlur={() => setMenuOpen(false)}
                    aria-label="Search for a city"
                />
            ) : (
                <AsyncPaginate
                    className={styles.search_input}
                    classNamePrefix="select"
                    placeholder="Search for a city"
                    debounceTimeout={300}
                    value={search}
                    onChange={handleOnChange}
                    loadOptions={loadOptions}
                    noOptionsMessage={() => "No cities found"}
                    aria-label="Search for a city"
                    styles={customStyles}
                    isClearable={true}
                    menuIsOpen={menuOpen}
                    onMenuClose={() => setMenuOpen(false)}
                    onBlur={() => setMenuOpen(false)}
                    onInputChange={(value) => {
                        setMenuOpen(value.length > 0);
                        return value;
                    }}
                />
            )}
            {loading && <Spinner />}
            {error && <div className="error_message">{error}</div>}
        </div>
    );
};

export default Search;