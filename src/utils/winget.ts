import chalk from "chalk";
import { exec, run } from "./cmd";

export interface WingetPackage {
  id: string;
  name: string;
  required?: boolean;
  version?: string;
  category?: string;
  description?: string;
}

export async function isInstalledWsl(id: string) {
  try {
    await run(`winget.exe list -e --id ${id}`);
    return true;
  } catch (e: any) {
    if (e.code === 20) {
      return false;
    }
    throw e;
  }
}

export async function installWsl(id: string) {
  console.info(chalk.greenBright(`${chalk.cyanBright(id)}: Installing...`));
  console.info();
  const result = await exec(`winget.exe install -e --id ${id}`);
  console.info();
  console.info();
  return result;
}

export async function uninstallWsl(id: string) {
  console.info(chalk.greenBright(`${chalk.cyanBright(id)}: Uninstalling...`));
  console.info();
  const result = await exec(`winget.exe uninstall -e --id ${id}`);
  console.info();
  console.info();
  return result;
}

export async function updateWsl(id: string, args?: string) {
  console.info(chalk.blueBright(`${chalk.cyanBright(id)}: Checking for updates...`));
  console.info();
  const result = await exec(`winget.exe upgrade -he --verbose-logs --id ${id}${args ? " " + args : ""}`);
  console.info();
  console.info();
  return result;
}

export async function updateOrInstallWsl(id: string) {
  if (await isInstalledWsl(id)) {
    return await updateWsl(id);
  }
  return await installWsl(id);
}
