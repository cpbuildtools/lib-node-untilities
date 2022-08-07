import { extname } from "path";

import { spawn } from "child_process";
import { exec } from "./cmd";
import { translateWslPath } from "./wsl";
import Path from "path/posix";

export function launchVSCode(path: string = ".") {
  spawn(`code ${path}`, { shell: true, detached: true, stdio: "ignore" });
}

export async function getContainerLaunchUrl(containerPath: string, workspace?: string) {
  const hexPath = Buffer.from(await translateWslPath(containerPath)).toString("hex");
  return `vscode-remote://dev-container+${Path.join(hexPath, workspace ?? "")}`;
}

export function launchContainerUrl(launchUrl: string) {
  const isWS = launchUrl.endsWith(".code-workspace");
  const flag = isWS ? "file-uri" : "folder-uri";
  const cmd = `code --${flag} "${launchUrl}"`;
  spawn(cmd, { shell: true, detached: true, stdio: "ignore" });
}

export async function launchVSCodeDevContainer(containerPath: string = ".", open?: string) {
  const isWS = extname(open ?? "") === ".code-workspace";
  const flag = isWS ? "file-uri" : "folder-uri";
  const hexPath = Buffer.from(await translateWslPath(containerPath)).toString("hex");
  let uri = `vscode-remote://dev-container+${hexPath}/${open ?? ""}`;
  const cmd = `code --${flag} "${uri}"`;
  spawn(cmd, { shell: true, detached: true, stdio: "ignore" });
}

export async function installVSCodeExtension(idOrPath: string, options?: { preRelease?: boolean; force?: boolean }) {
  const command = `code --install-extension ${idOrPath} ${options?.preRelease ? "--pre-release" : ""} ${options?.force ? "--force" : ""}`;
  await exec(command);
}

export async function uninstallVSCodeExtension(id: string) {
  const command = `code --uninstall-extension ${id} `;
  await exec(command);
}
