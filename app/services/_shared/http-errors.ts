export async function extractErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    const message = data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  } catch {
    // Usa fallback si no se pudo parsear JSON
  }

  return fallback;
}
