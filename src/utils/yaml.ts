import { highlight } from "cli-highlight";
import { readFile, writeFile } from "fs/promises";
import Yaml from "yaml";

export async function readYamlFile<T = unknown>(path: string): Promise<T> {
  return Yaml.parse(await readFile(path, { encoding: "utf-8" }));
}

export async function writeYamlFile(path: string, data: any, indent?: number) {
  await writeFile(path, toFormattedYaml(data, { indent }));
}

export async function printYamlFile(path: string, opt?: { indent?: number; cliColor?: boolean }) {
  printAsYaml(await readYamlFile(path), opt);
}

export function printAsYaml(data: any, opt?: { indent?: number; cliColor?: boolean }) {
  console.info(toFormattedYaml(data, opt));
}

export function toFormattedYaml(data: any, opt: { indent?: number; cliColor?: boolean } = {}) {
  let yml = Yaml.stringify(data, { indent: opt.indent ?? 2 });
  if (opt.cliColor) {
    yml = highlight(yml, { language: "yaml" });
  }
  return yml;
}
