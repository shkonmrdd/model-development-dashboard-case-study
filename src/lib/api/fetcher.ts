export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const details = response.statusText || "Request failed";
    throw new Error(`${details} (${response.status})`);
  }

  return (await response.json()) as T;
}
