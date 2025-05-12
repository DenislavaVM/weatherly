import { useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { fetchCities } from "../../api/geoApi";
import styles from "./Search.module.css";
import Spinner from "../ui/Spinner";

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
            />

            {loading && <Spinner />}
            {error && <div className="error_message">{error}</div>}
        </div>
    );
};

export default Search;