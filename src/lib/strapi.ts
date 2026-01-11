import qs from "qs";

// Astro uses import.meta.env for environment variables
export const STRAPI_URL = import.meta.env.STRAPI_URL || "http://localhost:1337";

export async function fetchAPI(
    path: string,
    urlParamsObject = {},
    options = {}
) {
    try {
        const mergedOptions = {
            headers: {
                "Content-Type": "application/json",
            },
            ...options,
        };

        const queryString = qs.stringify(urlParamsObject);
        const requestUrl = `${STRAPI_URL}/api${path}${queryString ? `?${queryString}` : ""}`;

        console.log(`Fetching from: ${requestUrl}`);

        const response = await fetch(requestUrl, mergedOptions);

        if (!response.ok) {
            console.error(`Error fetching from Strapi: ${response.status} ${response.statusText}`);
            try {
                const errorBody = await response.text();
                console.error(`Error body: ${errorBody}`);
            } catch (e) {
                console.error("Could not read error body");
            }
            throw new Error(`An error occurred please try again`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw new Error(`Please check if your server is running and you set all the required tokens.`);
    }
}

export function getStrapiMedia(url: string | null) {
    if (url == null) {
        return null;
    }

    if (url.startsWith("http") || url.startsWith("//")) {
        return url;
    }

    return `${STRAPI_URL}${url}`;
}
