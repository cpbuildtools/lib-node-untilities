export interface AfterUpdate {
  afterUpdate(): void | Promise<void>;
}

export function implementsAfterUpdate(obj: any): obj is AfterUpdate {
  return typeof obj?.afterUpdate === "function";
}
