type ServerInfo = {
  baseUrl: string;
  cookieHeader: string;
};

function getServerInfo(): ServerInfo | null {
  if (typeof window !== "undefined") return null;
  // Lazy import to keep this module safe for client usage.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { headers, cookies } = require("next/headers") as {
    headers: () => { get(name: string): string | null };
    cookies: () => { getAll(): Array<{ name: string; value: string }> };
  };

  const headersList = headers();
  const cookieStore = cookies();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";

  return {
    baseUrl: host ? `${protocol}://${host}` : "http://localhost:3000",
    cookieHeader: cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; "),
  };
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.clone().json()) as { error?: unknown };
    if (typeof payload?.error === "string" && payload.error.trim()) {
      return payload.error;
    }
    if (payload?.error) {
      return JSON.stringify(payload.error);
    }
  } catch {
    // ignore JSON parse errors
  }

  try {
    const text = await response.clone().text();
    if (text.trim()) return text;
  } catch {
    // ignore text read errors
  }

  return `API request failed: ${response.status}`;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const serverInfo = getServerInfo();
  const baseUrl = serverInfo?.baseUrl ?? "";
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(serverInfo?.cookieHeader ? { cookie: serverInfo.cookieHeader } : {}),
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}