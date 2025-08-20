export const fetchData = async (url, options = {}, retries = 5, signal, backoff = 1000) => {
    try {
        const res = await fetch(url, { ...options, signal });
        if (!res.ok) {
            throw new Error("API Error");
        };

        return await res.json();
    } catch (err) {
        if (err.name === "AbortError") {
            throw err;
        };

        if (retries > 0) {
            await new Promise((r) => setTimeout(r, backoff));
            return fetchData(url, options, retries - 1, signal, backoff * 2);
        };

        throw err;
    };
};