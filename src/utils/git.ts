import simpleGit from "simple-git";

export async function getConfig(name: string) {
  const git = simpleGit();
  const result = await git.getConfig(name, "global");
  return result.value;
}

export async function setConfig(name: string, value: string) {
  const git = simpleGit();
  const result = await git.addConfig(name, value, false, "global");
  return result;
}
