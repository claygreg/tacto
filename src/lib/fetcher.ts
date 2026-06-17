/**
 * Shared fetcher for SWR.
 * Throws on non-2xx responses so SWR can surface the error.
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Erro ao carregar dados.") as Error & { status: number };
    error.status = res.status;
    throw error;
  }
  return res.json();
}
