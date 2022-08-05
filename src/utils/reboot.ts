import chalk from "chalk";
import { mkdir, readFile, rm, writeFile } from "fs/promises";

import inquirer from "inquirer";
import { join, resolve } from "path";
import { exit } from "process";
import { exec } from "./cmd";
import { escapeString } from "./strings";
import { translateWslPath } from "./wsl";

export async function rebootWindows(resumeCommand?: string): Promise<never> {
  const path = resolve(join(__dirname, "../.tmp"));
  const file = resolve(join(path, "resume.cmd"));
  await rm(path, { force: true, recursive: true });
  await mkdir(path, { recursive: true });

  const rng = Math.random() * 10000 + 10000;
  let tpl = await readFile(join(__dirname, "../admin-resume.cmd.template"), { encoding: "utf-8" });
  tpl += `\n${resumeCommand}`;
  tpl += `\npause`;
  await writeFile(file, tpl, { encoding: "utf-8" });

  const winFile = await translateWslPath(file);

  await exec(
    `reg.exe add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce" /v !devenv${rng} /d "${escapeString(
      winFile
    )}" /f`
  );
  console.info();
  console.info(chalk.yellow("********************************************************************"));
  console.info(chalk.yellow("* Windows need to be restarted... because windows...               *"));
  console.info(chalk.yellow("*                                                                  *"));
  console.info(chalk.yellow("* Installation will resume after reboot                            *"));
  console.info(chalk.yellow("********************************************************************"));
  console.info();
  const answer = await inquirer.prompt({
    type: "confirm",
    name: "rebootNow",
    message: "Reboot Now?",
  });
  if (answer.rebootNow) {
    await exec(`shutdown.exe -r -t 0`);
  }
  exit(0);
}
