import { run } from "./cmd";

export async function translateWindowsPath(path: string): Promise<string> {
  const result = await (await run(`wslpath -a -u "${path}"`)).trim();
  return result;
}
export async function translateWslPath(path: string): Promise<string> {
  try {
    return (await run(`wslpath -a -w "${path}"`)).trim();
  } catch {
    return path;
  }
}
