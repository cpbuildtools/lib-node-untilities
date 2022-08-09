export interface BeforeUpdate {
  beforeUpdate(): boolean | undefined | Promise<boolean | undefined>;
}

export function implementsBeforeUpdate(obj: any): obj is BeforeUpdate {
  return typeof obj?.beforeUpdate === "function";
}
