"use client";

/**
 * A wrapper around the native fetch API that handles 401 Unauthorized responses
 * by redirecting the user to the login page.
 *
 * @param {string} input - The URL to fetch.
 * @param {RequestInit} [init] - Optional fetch options.
 * @returns {Promise<Response>} - The fetch response.
 */
export async function fetchClient(input, init) {
    const res = await fetch(input, init);

    if (res.status === 401) {
        if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
        }
        // Throwing an error to stop downstream processing
        throw new Error("Unauthorized");
    }

    return res;
}
