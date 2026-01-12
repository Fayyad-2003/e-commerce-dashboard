// دالة عامة تجيب JSON من أي endpoint
export async function getJSON(path, { token, query, init } = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL; // حط الـ base URL بالـ .env.local
  const url = new URL(path, base);

  // لو بدك تمرر باراميترز
  if (query) {
    Object.entries(query).forEach(([k, v]) =>
      url.searchParams.set(k, v)
    );
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/auth/login";
    // throw to stop execution
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${url} failed: ${res.status} ${text}`);
  }

  return res.json();
}
