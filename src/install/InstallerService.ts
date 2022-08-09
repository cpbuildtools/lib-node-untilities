import { DepGraph } from "dependency-graph";
import glob from "fast-glob";
import { existsSync } from "fs";
import Enumerable from "linq";
import path from "path/posix";
import { depGraphToArray } from "../utils/dep_graph";
import { Installer, isValidInstaller } from "./installer/Installer";
import { InstallItem } from "./InstallItem";
import { detectPlatform } from "./platform/detectPlatform";
import { KnownPlatforms } from "./platform/KnownPlatforms";
import { Platform } from "./platform/Platform";
import { PlatformInstaller } from "./platform/PlatformInstaller";

export class InstallerService {
  private _init?: Promise<void>;
  private _scanDirs: string[] = [];
  private _installers: Map<string, Installer> = new Map();

  constructor() {
    this.scanDir(path.join(__dirname, "_installers_"));
  }

  public scanDir(path: string) {
    if (!this._scanDirs.includes(path)) {
      this._scanDirs.push(path);
    }
    return this;
  }

  private async scanForInstallers() {
    const files = (
      await Promise.all(
        this._scanDirs.filter((d) => existsSync(d)).map((d) => glob(["*.installer.js", "*/*.installer.js"].map((p) => path.join(d, p))))
      )
    ).flat();

    const installers = (await Promise.all(files.map((f) => import(f))))
      .filter((m) => !!m.default)
      .map((m) => (Array.isArray(m.default) ? m.default : [m.default]))
      .map((m: any[]) => {
        return m.filter((i) => isValidInstaller(i)) as Installer[];
      })
      .flat();
    return installers;
  }

  private init() {
    if (!this._init) {
      this._init = (async () => {
        const scannedInstallers = await this.scanForInstallers();
        scannedInstallers.forEach((inst) => this._addInstaller(inst));
      })();
    }
    return this._init;
  }

  private _addInstaller(installer: Installer) {
    if (isValidInstaller(installer)) {
      this._installers.set(installer.id, installer);
    }
  }

  public addInstaller(installer: Installer) {
    if (!this._init) {
      this._addInstaller(installer);
    } else {
      throw new Error(`Install Service already initialized. Can't add any more installers.`);
    }
  }

  public get installers() {
    return (async () => {
      await this.init();
      return Enumerable.from(this._installers.values());
    })();
  }

  public async getInstallerById(id: string, forPlatform?: KnownPlatforms) {
    return (await this.installers).firstOrDefault(
      (i) => i.id === id && (!forPlatform || typeof i.platforms === "function" || !!i.platforms[forPlatform])
    );
  }

  public async getPlatformInstallerById(id: string, forPlatform?: KnownPlatforms) {
    if (!forPlatform) {
      const detected = detectPlatform();
      if (detected === Platform.UNKNOWN) {
        throw new Error("Could not detect Platform");
      }
      forPlatform = detected;
    }

    const platforms = (await this.getInstallerById(id, forPlatform))?.platforms;
    return typeof platforms === "function" ? platforms : platforms?.[forPlatform];
  }

  public async hasInstaller(id: string, forPlatform?: KnownPlatforms) {
    return !!(await this.getInstallerById(id, forPlatform));
  }

  private async createInstallerInstance(id: string): Promise<PlatformInstaller | undefined> {
    const platform = detectPlatform();
    if (platform === Platform.UNKNOWN) {
      return undefined;
    }
    const installer = await this.getPlatformInstallerById(id, platform);
    return installer ? new installer() : undefined;
  }

  public async isInstalled(id: string): Promise<boolean> {
    const inst = await this.createInstallerInstance(id);
    return (await inst?.isInstalled) ?? false;
  }

  public async installOrUpdateById(id: string): Promise<void> {
    const inst = await this.createInstallerInstance(id);
    await inst?.installOrUpdate();
  }
  public async uninstallById(id: string): Promise<void> {
    const inst = await this.createInstallerInstance(id);
    await inst?.uninstall();
  }
  public async updateById(id: string): Promise<void> {
    const inst = await this.createInstallerInstance(id);
    await inst?.update();
  }

  private async getListItems(list: InstallItem[]) {
    return (await this.installers).join(
      list,
      (o) => o.id,
      (i) => i.id,
      (o, i) => ({
        ...i,
        installer: o,
      })
    );
  }

  private async buildInstallerRunList(list: InstallItem[]) {
    const graph = new DepGraph<PlatformInstaller>();
    for (const i of list) {
      await this.buildInstallerRunListAdd(graph, i.id);
    }
    const order = depGraphToArray(graph);
    return order;
  }
  private async buildInstallerRunListAdd<T>(graph: DepGraph<PlatformInstaller>, id: string) {
    const installerClass = await this.getPlatformInstallerById(id);
    if (!installerClass) {
      throw new Error(`Could not find installer with id "${id}"`);
    }

    const inst = new installerClass();
    graph.addNode(id, inst);

    if (inst.dependencies?.length) {
      for (const dep of inst.dependencies) {
        await this.buildInstallerRunListAdd(graph, dep);
        graph.addDependency(id, dep);
      }
    }
  }

  public async update(list: InstallItem[]): Promise<void> {
    const installs = await this.buildInstallerRunList(list);
    for (const inst of installs) {
      await inst.update();
    }
  }

  public async installOrUpdate(list: InstallItem[]): Promise<void> {
    const installs = await this.buildInstallerRunList(list);
    for (const inst of installs) {
      await inst.installOrUpdate();
    }
  }

  public async uninstall(list: InstallItem[]): Promise<void> {
    const installs = (await this.buildInstallerRunList(list)).reverse();
    for (const inst of installs) {
      await inst.uninstall();
    }
  }
}

export const GlobalInstallerService = new InstallerService();
