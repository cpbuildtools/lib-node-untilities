import { run } from "./cmd";
import { translateWindowsPath } from "./wsl";

export interface AppxPackage {
  Name: string;
  Publisher: string;
  Architecture: string;
  ResourceId: string;
  Version: string;
  PackageFullName: string;
  InstallLocation: string;
  IsFramework: string;
  PackageFamilyName: string;
  PublisherId: string;
  IsResourcePackage: string;
  IsBundle: string;
  IsDevelopmentMode: string;
  NonRemovable: string;
  IsPartiallyStaged: string;
  SignatureKind: string;
  Status: string;
}

export async function loadAppxPackages(): Promise<AppxPackage[]> {
  const result = await run(`powershell.exe Get-AppxPackage"`);
  return result
    .split("\n\n")
    .map((appStr) => appStr.trim().split("\n"))
    .map((lines) => {
      const result: any = {};
      lines.forEach((line) => {
        const p = line.split(":", 2);
        result[p[0].trim()] = p[1].trim();
      });
      return result;
    });
}

export async function loadAppxPackage(appxPackageName: string): Promise<AppxPackage | undefined> {
  const packages = await loadAppxPackages();
  return packages.find((p) => p.Name === "appxPackageName");
}

export async function locateInstallationPath(appxPackageName: string): Promise<string | undefined> {
  const pkg = await loadAppxPackage(appxPackageName);
  return pkg?.InstallLocation ? translateWindowsPath(pkg?.InstallLocation) : undefined;
}
