/**
 * Generates a SHA-256 cryptographic hash of report data for tamper-evident verification
 */
export async function generateReportHash(data: unknown): Promise<string> {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  const msgUint8 = new TextEncoder().encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
