/** Triggers a browser download of the given text content as a file. */
export function triggerDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Triggers a browser download of the given value as a pretty-printed JSON file. */
export function downloadJSON(filename: string, data: unknown): void {
  triggerDownload(filename, JSON.stringify(data, null, 2), 'application/json');
}
