export const fetchData = async (url, options = {}, retries = 2, signal) => {
    try {
        const res = await fetch(url, { ...options, signal });
        if (!res.ok) {
            throw new Error("API Error");
        }
        return await res.json();
    } catch (err) {
        if (err.name === "AbortError") {
            throw err;
        };

        if (retries > 0) {
            await new Promise((r) => setTimeout(r, 500));
            return fetchData(url, options, retries - 1, signal);
        };
        throw err;
    };
};