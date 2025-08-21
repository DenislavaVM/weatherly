export const fetchData = async (url, options = {}, retries = 5, signal, backoff = 1000) => {
    try {
        const res = await fetch(url, { ...options, signal });
        if (!res.ok) {
            let body = null;
            try {
                body = await res.json();
            } catch (e) {
                body = null;
            }
            const e = new Error(body?.error?.message || `HTTP ${res.status}`);
            e.status = res.status;
            e.body = body;
            throw e;
        };
        return await res.json();
    } catch (err) {
        if (err.name === "AbortError") {
            throw err;
        };
        if (retries > 0) {
            await new Promise((r) => setTimeout(r, backoff));
            const nextBackoff = Math.min(backoff * 2, 8000);
            return fetchData(url, options, retries - 1, signal, nextBackoff);
        };
        throw err;
    };
};