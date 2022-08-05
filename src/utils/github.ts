import chalk from "chalk";
import { exec } from "./cmd";

export async function githubLogin(user: string, token: string) {
  console.info(`Attempting to log into github.com with user ${chalk.yellowBright(user)}`);
  const result = await exec(`echo "${token}" | gh auth login --with-token`);
  return !result;
}

export async function configureGithubCli() {
  console.info(`Configuring Github Cli`);
  await exec(`gh config set git_protocol https -h github.com`);
  await exec(`gh auth setup-git`);
}
