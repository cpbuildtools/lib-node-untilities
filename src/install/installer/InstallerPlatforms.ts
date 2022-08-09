import { Class } from "type-fest";
import { KnownPlatforms } from "../platform/KnownPlatforms";
import { PlatformInstaller } from "../platform/PlatformInstaller";

export declare type InstallerPlatforms = {
  [platform in KnownPlatforms]?: Class<PlatformInstaller>;
};
