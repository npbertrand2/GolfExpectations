const defaultApiUrl = process.env.API_URL ?? "http://127.0.0.1:3000";

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${defaultApiUrl}${path}`, {
    method: "GET",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
