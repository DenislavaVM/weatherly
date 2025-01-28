import { useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { fetchCities } from "../../api/geoApi";

const Search = ({ onSearchChange }) => {
    const [search, setSearch] = useState(null);
    const [error, setError] = useState(null);

    const loadOptions = async (inputValue) => {
        if (!inputValue || inputValue.trim() === "") {
            return { options: [] };
        }

        try {
            const result = await fetchCities(inputValue);
            if (!result.data || !Array.isArray(result.data)) {
                throw new Error("Invalid API response");
            }

            return {
                options: result.data.map((city) => ({
                    value: `${city.latitude || 0} ${city.longitude || 0}`,
                    label: `${city.name || "Unknown"}, ${city.countryCode || ""}`,
                })),
            };
        } catch (error) {
            console.error("Error loading options:", error);
            setError("Failed to load city data. Please try again.");
            return { options: [] };
        }
    };

    const handleOnChange = (searchData) => {
        setSearch(searchData);
        setError(null);
        onSearchChange(searchData);
    };

    return (
        <div>
            <AsyncPaginate
                placeholder="Search for city"
                debounceTimeout={600}
                value={search}
                onChange={handleOnChange}
                loadOptions={loadOptions}
            />
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Search;