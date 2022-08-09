export interface BeforeInstallOrUpdate {
  beforeInstallOrUpdate(): boolean | undefined | Promise<boolean | undefined>;
}

export function implementsBeforeInstallOrUpdate(obj: any): obj is BeforeInstallOrUpdate {
  return typeof obj?.beforeInstallOrUpdate === "function";
}
