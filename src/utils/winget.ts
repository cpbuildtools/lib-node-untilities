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

export async function isInstalled(id: string) {
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

export async function install(id: string) {
  console.info(chalk.greenBright(`${chalk.cyanBright(id)}: Installing...`));
  console.info();
  const result = await exec(`winget.exe install -e --id ${id}`);
  console.info();
  console.info();
  return result;
}

export async function update(id: string, args?: string) {
  console.info(chalk.blueBright(`${chalk.cyanBright(id)}: Checking for updates...`));
  console.info();
  const result = await exec(`winget.exe upgrade -he --verbose-logs --id ${id}${args ? " " + args : ""}`);
  console.info();
  console.info();
  return result;
}

export async function updateOrInstall(id: string) {
  if (await isInstalled(id)) {
    return await update(id);
  }
  return await install(id);
}
