export function escapeString(str: string): string {
  str = JSON.stringify(String(str));
  str = str.substring(1, str.length - 1);
  return str;
}
