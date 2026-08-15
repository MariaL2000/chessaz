export async function triggerSecureDownload(
  downloadUrl: string,
  fallbackFilename = "resource",
) {
  const response = await fetch(downloadUrl, { credentials: "same-origin" });

  if (!response.ok) {
    let message = `Unable to download this resource (Status ${response.status}).`;

    try {
      // Intentamos leer el texto de la respuesta primero
      const errorText = await response.text();
      try {
        // Si es JSON, extraemos el campo 'error' o 'message'
        const data = JSON.parse(errorText) as {
          error?: string;
          message?: string;
        };
        if (data.error || data.message) {
          message = data.error || data.message || message;
        }
      } catch {
        // Si no es JSON (es HTML o texto plano), mostramos un resumen en consola
        console.error("Non-JSON error response from server:", errorText);
      }
    } catch (e) {
      console.error("Error reading response body:", e);
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  const filenameMatch = disposition?.match(/filename="(.+?)"/);
  const filename = filenameMatch?.[1] ?? fallbackFilename;

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
