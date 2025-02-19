export const fetchData = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);

        if (!response || !response.ok) {
            throw new Error(`API error: ${response?.status || "Unknown"} - ${response?.statusText || "No response"}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API fetch error:", error);
        throw error;
    }
};