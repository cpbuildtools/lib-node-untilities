import chalk from "chalk";
import { existsSync } from "fs";
import { join } from "path";
import { exec, run } from "./cmd";
import { sleep } from "./sleep";
import { translateWindowsPath } from "./wsl";

export async function dockerLogin(url: string, user: string, token: string) {
  console.info(`Attempting to log docker into ${chalk.blueBright(url)} with user ${chalk.yellowBright(user)}`);
  const result = await exec(`echo "${token}" | docker login ${url} -u ${user} --password-stdin`);
  return !result;
}

export async function getDockerDesktopPath() {
  const path = await translateWindowsPath("C:\\Program Files\\Docker\\Docker");
  return path;
}

export async function startDockerDesktop(appdata: string) {
  try {
    const cmd = `"${await getDockerDesktopPath()}/Docker Desktop.exe" &`;
    await exec(cmd);
    const dockerConfigPath = await getDockerConfigPath(appdata);
    while (!existsSync(dockerConfigPath)) {
      await sleep(500);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function restartDocker(appdata: string) {
  console.info(chalk.gray("Restarting Docker Desktop..."));
  await killDocker();
  await startDockerDesktop(appdata);
  await waitForDockerInit(true);
}

export async function getDockerConfigPath(appdata: string) {
  const appdataPath = (await translateWindowsPath(appdata)).trim();
  return join(appdataPath, "Docker", "settings.json");
}

export async function killDocker() {
  try {
    return await run('taskkill.exe /IM "Docker Desktop.exe" /F');
    return true;
  } catch {
    return false;
  }
}

export async function waitForDockerInit(isRestart: boolean = false) {
  let c = 0;
  const headerDelay = isRestart ? 120 : 8;

  while (c !== -1) {
    try {
      if (c < headerDelay) {
        c++;
      } else if (c === headerDelay) {
        if (isRestart) {
          console.info();
          console.info(chalk.yellow("********************************************************************"));
          console.info(chalk.yellow("* Waiting for docker to restart...                                 *"));
          console.info(chalk.yellow("*                                                                  *"));
          console.info(chalk.yellow("* If it fails to start automatically make sure it is running       *"));
          console.info(chalk.yellow("* and if nessisarry execute a restart from the taskbar menu.       *"));
          console.info(chalk.yellow("*                                                                  *"));
          console.info(chalk.yellow("* Sure is taking it's time          (╯°□°)╯︵ ┻━┻                 *"));
          console.info(chalk.yellow("********************************************************************"));
          console.info();
        } else {
          console.info();
          console.info(chalk.yellow("********************************************************************"));
          console.info(chalk.yellow("* Waiting for access to docker                                     *"));
          console.info(chalk.yellow("*                                                                  *"));
          console.info(chalk.yellow("* Please make sure that docker desktop is running and restart      *"));
          console.info(chalk.yellow("* the service if nessisarry                                        *"));
          console.info(chalk.yellow("********************************************************************"));
          console.info();
        }
        c++;
      }
      await run("docker info");
      if (c >= headerDelay) {
        if (isRestart) {
          console.info(chalk.grey("Docker is ready.                     ┬─┬ノ(º_ºノ)"));
        } else {
          console.info(chalk.grey("Docker is ready."));
        }
      }
      c = -1;
    } catch {
      await sleep(250);
    }
  }
}
