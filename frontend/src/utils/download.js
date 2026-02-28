// utils/download.js
// Simple helper to download a Blob or ArrayBuffer as a file with proper cleanup

export function downloadBlob(data, filename, mimeType = 'application/octet-stream', { onSuccess, onError } = {}) {
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
    return true;
  } catch (e) {
    console.error('downloadBlob error:', e);
    if (typeof onError === 'function') {
      onError(e);
    }
    return false;
  }
}
