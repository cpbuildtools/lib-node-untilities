import chalk from "chalk";
import { DepGraph } from "dependency-graph";
import glob from "fast-glob";
import FsSync from "fs";
import Enumerable from "linq";
import Path from "path/posix";
import { PackageJson } from "type-fest";
import { exec } from "../../utils";
import { IPackageHandler } from "../IPackageHandler";
import { PackageManager } from "../PackageManager";
import { RunScriptOptions } from "../RunScriptOptions";
import { isWorkspaceCallError, WorkspaceCallError } from "../WorkspaceCallError";
import { WorkspaceCallOptions } from "../WorkspaceCallOptions";
import { isWorkspaceCallSuccess, WorkspaceCallSuccess } from "../WorkspaceCallSuccess";
import { WorkspaceSortingOptions } from "../WorkspaceSortingOptions";

export abstract class Package implements IPackageHandler {
  private readonly _path: string;
  private readonly _file: string;
  private _data: PackageJson & { [key: string]: unknown } = {};

  public constructor(data: PackageJson, path: string, filename: string) {
    this._path = path;
    this._file = filename;
    this._data = data as PackageJson & { [key: string]: unknown };
  }

  public get path(): string {
    return this._path;
  }

  public get fileName(): string {
    return this._file;
  }

  public get fileType(): string {
    return Path.extname(this._file);
  }

  protected get data() {
    return this._data;
  }

  public get name() {
    return this.data.name;
  }

  public get version() {
    return this.data.version;
  }

  public get dependencies() {
    this.data.dependencies ??= {};
    return this.data.dependencies;
  }

  public get devDependencies() {
    this.data.devDependencies ??= {};
    return this.data.devDependencies;
  }

  public get peerDependencies() {
    this.data.peerDependencies ??= {};
    return this.data.peerDependencies;
  }

  public get optionalDependencies() {
    this.data.optionalDependencies ??= {};
    return this.data.optionalDependencies;
  }

  public get dependencyNames() {
    return Object.keys(this.dependencies);
  }

  public get devDependencyNames() {
    return Object.keys(this.devDependencies);
  }

  public get peerDependencyNames() {
    return Object.keys(this.peerDependencies);
  }

  public get optionalDependencyNames() {
    return Object.keys(this.optionalDependencies);
  }

  public async execCmd(cmd: string) {
    this.logInfo(chalk.blueBright(`Executing: ${chalk.gray(cmd)}`));
    return await exec(cmd, { cwd: this.path });
  }

  protected abstract execPackageManager(cmd: string): Promise<number>;

  public get scripts() {
    this.data.scripts ??= {};
    return this.data.scripts;
  }

  public hasScript(scriptName: string) {
    return !!this.scripts[scriptName]?.trim();
  }

  public async runScript(script: string, options?: Partial<RunScriptOptions>): Promise<number | undefined> {
    const opts: RunScriptOptions = {
      ...options,
      throwOnError: options?.throwOnError ?? true,
      throwOnMissing: options?.throwOnMissing ?? true,
    };

    const scriptName: string = script.split(/\s/, 1)[0].trim();
    if (!this.hasScript(scriptName)) {
      if (opts?.throwOnMissing !== false) {
        this.logError(`Package does't have a script named '${chalk.cyanBright(scriptName)}'`);
        throw new Error(`Package does't have a script named '${scriptName}'`);
      }
      this.logInfo(`Package does't have a script named '${chalk.cyanBright(scriptName)}'. Skipping...`);
      return undefined;
    }
    this.logInfo(chalk.green(`Running ${chalk.cyanBright(scriptName)}`));
    let code = await this.execPackageScript(script);
    if (code !== 0) {
      if (opts?.throwOnError !== false) {
        this.logError(`Script '${chalk.cyanBright(scriptName)}' failed with exit code ${chalk.redBright(code)}`);
        throw new Error(`Script '${scriptName}' failed with exit code ${code}`);
      }
    }
    return code;
  }

  protected execPackageScript(script: string): Promise<number> {
    return this.execPackageManager(`run ${script}`);
  }

  public get isWorkspace() {
    return !!this.data.workspaces;
  }

  public get workspaces() {
    return (this.data.workspaces ??= []);
  }

  private async _workspaceQueryFactory() {
    const base = Enumerable.from(
      Array.isArray(this.workspaces)
        ? (this.data.workspaces as string[])
        : Array.isArray(this.workspaces.packages)
        ? this.workspaces.packages
        : []
    ).select((p) => {
      const result = glob(p, { cwd: this.path, onlyDirectories: true });
      return result;
    });

    const packages = Enumerable.from(
      await Promise.all(
        Enumerable.from(await Promise.all(base.toArray()))
          .selectMany((paths) => paths)
          .select((p) => (Path.isAbsolute(p) ? p : Path.join(this.path, p)))
          .where((p) => FsSync.existsSync(Path.join(p, "package.json")))
          .select((p) => PackageManager.loadPackage(p))
      )
    ).orderBy((p) => p.name);

    return packages.asEnumerable();
  }
  private _workspaceQuery?: Promise<Enumerable.IEnumerable<IPackageHandler>>;

  protected get workspaceQuery() {
    return (this._workspaceQuery ??= this._workspaceQueryFactory());
  }

  public async listWorkspacePackages() {
    return (await this.workspaceQuery).toArray();
  }

  public async listWorkspaceNames() {
    return (await this.workspaceQuery).select((p) => p.name).toArray();
  }

  public async workspaceExecute(cmd: string, options: Partial<WorkspaceSortingOptions & WorkspaceCallOptions>) {
    return this.workspaceCall(async (pkg) => {
      return await pkg.execCmd(cmd);
    }, options);
  }

  public workspaceRunScript(cmd: string, options: Partial<WorkspaceSortingOptions & RunScriptOptions>) {
    return this.workspaceCall(async (pkg) => {
      return await pkg.runScript(cmd, options);
    }, options);
  }

  public async workspaceCall<T, TError = unknown>(
    fn: (pkg: IPackageHandler) => Promise<T>,
    options: Partial<WorkspaceSortingOptions & WorkspaceCallOptions>
  ) {
    const opt = this._applyWorkspaceSortingOptionDefaults(options);
    opt.throwOnError ??= false;

    const sequence = await this._buildWorkspaceWalkingOrder(opt);
    const results: (WorkspaceCallSuccess<T> | WorkspaceCallError<TError>)[] = [];

    for (const parallel of sequence) {
      const parallelPromises: Promise<WorkspaceCallSuccess<T> | WorkspaceCallError<TError>>[] = [];
      for (const pkg of parallel) {
        const fnWrapper = async (pkg: IPackageHandler) => {
          try {
            const result = await fn(pkg);
            return {
              package: pkg,
              result: result as T,
              success: true,
            } as WorkspaceCallSuccess<T>;
          } catch (e) {
            if (opt.throwOnError) {
              throw e;
            }
            return {
              package: pkg,
              error: e,
              success: false,
            } as WorkspaceCallError<TError>;
          }
        };
        const promise = fnWrapper(pkg);
        parallelPromises.push(promise);
      }
      const result = await Promise.all(parallelPromises);
      results.push(...result);
    }
    const resultsQuery = Enumerable.from(results);

    const rError = resultsQuery.where((r) => isWorkspaceCallError(r)).cast<WorkspaceCallError<TError>>();
    const rSuccess = resultsQuery.where((r) => isWorkspaceCallSuccess(r)).cast<WorkspaceCallSuccess<T>>();

    return {
      hasErrors: rError.any(),
      errors: rError.toArray(),
      results: rSuccess.toArray(),
    };
  }

  private _applyWorkspaceSortingOptionDefaults<T extends Partial<WorkspaceSortingOptions>>(options: T): T & WorkspaceSortingOptions {
    return {
      ...options,
      parallel: options.parallel ?? false,
      dependencies: options.dependencies ?? false,
      devDependencies: options.devDependencies ?? false,
      optionalDependencies: options.optionalDependencies ?? false,
      peerDependencies: options.peerDependencies ?? false,
    } as T & WorkspaceSortingOptions;
  }

  private async _buildWorkspaceWalkingOrder(options: WorkspaceSortingOptions) {
    let packages: IPackageHandler[][] = [];
    if (options.dependencies || options.devDependencies || options.peerDependencies || options.optionalDependencies) {
      packages = await this._buildWorkspaceDependencyArray(options);
      if (!options.parallel) {
        packages = packages.flat().map((p) => [p]);
      }
    } else {
      const q = await this.workspaceQuery;
      if (options.parallel) {
        packages = [q.toArray()];
      } else {
        packages = q.select((p) => [p]).toArray();
      }
    }
    return packages;
  }

  private async _buildWorkspaceDependencyArray(opts: WorkspaceSortingOptions) {
    const runOrder: IPackageHandler[][] = [];
    const depGraph = (await this._buildWorkspaceDependencyGraph(opts)).clone();

    let packages = depGraph.overallOrder(true).map((name) => depGraph.getNodeData(name) as IPackageHandler);

    while (packages?.length) {
      runOrder.push(packages);
      packages.forEach((p) => depGraph.removeNode(p.name!));
      packages = depGraph.overallOrder(true).map((name) => depGraph.getNodeData(name) as IPackageHandler);
    }
    return runOrder;
  }

  private async _buildWorkspaceDependencyGraph(opts: WorkspaceSortingOptions) {
    const depGraph = new DepGraph();
    const packagesQuery = await this.workspaceQuery;
    packagesQuery.forEach((pkg) => {
      depGraph.addNode(pkg.name!, pkg);
    });

    const deps = packagesQuery.select((p) => ({
      name: p.name,
      deps: [
        ...(!opts.dependencies ? [] : p.dependencyNames),
        ...(!opts.devDependencies ? [] : p.devDependencyNames),
        ...(!opts.peerDependencies ? [] : p.peerDependencyNames),
        ...(!opts.optionalDependencies ? [] : p.optionalDependencyNames),
      ],
    }));

    deps.forEach((p) => {
      p.deps.forEach((d) => {
        depGraph.addDependency(p.name!, d);
      });
    });

    return depGraph;
  }

  protected printLog(msg: string) {
    return chalk.white(chalk.blueBright(`[${chalk.yellow(this.name)}]`) + ` ${msg}`);
  }

  protected logInfo(msg: string) {
    console.info(`${chalk.bgGray.black.bold(" Info ")} ${this.printLog(msg)}`);
  }

  protected logWarn(msg: string) {
    console.warn(`${chalk.bgYellow.black.bold(" Warning ")} ${this.printLog(msg)}`);
  }

  protected logError(msg: string) {
    console.error(`${chalk.bgRed.white.bold(" ERROR ")} ${this.printLog(msg)}`);
  }

  public async install() {
    return await this.execPackageManager("install");
  }

  public async workspaceInstall(options: Partial<WorkspaceSortingOptions & RunScriptOptions>) {
    return this.workspaceCall(async (pkg) => {
      return await pkg.install();
    }, options);
  }
}
