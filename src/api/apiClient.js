export const fetchData = async (url, options = {}, retries = 2) => {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error("API Error");
        };

        return await response.json();
    } catch (error) {
        if (retries > 0) {
            await new Promise(res => setTimeout(res, 1000));
            return fetchData(url, options, retries - 1);
        };
        throw error;
    };
};