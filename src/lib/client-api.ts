interface ApiErrorBody {
  error?: string;
  details?: Record<string, string[] | undefined>;
}

export class ApiRequestError extends Error {}

function errorMessage(body: ApiErrorBody, fallback: string): string {
  const details = body.details
    ? Object.values(body.details).flatMap((messages) => messages ?? [])
    : [];
  const message = body.error || fallback;
  return details.length ? `${message}: ${details.join(" ")}` : message;
}

/** Fetch JSON and expose one consistent, user-safe error shape to client UIs. */
export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new ApiRequestError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
  }

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  if (!response.ok) {
    throw new ApiRequestError(errorMessage(body, "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง"));
  }

  return body as T;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
