import { AfterInstall } from "../hooks";
import { Installer } from "../installer/Installer";
import { Platform } from "../platform/Platform";
import { WingetInstaller } from "../platformInstallers/WingetInstaller";
import { AptInstaller } from "../platformInstallers/AptInstaller";

const DockerInstaller: Installer = {
  id: "docker",
  name: "Docker",
  platforms: {
    [Platform.WSL]: class DockerWslInstaller extends WingetInstaller implements AfterInstall {
      constructor() {
        super("Docker.DockerDesktop", "Docker Desktop");
      }
      async afterInstall(): Promise<void> {}
    },
    [Platform.LINUX]: class DockerLinuxInstaller extends AptInstaller {
      constructor() {
        super("docker", "Docker");
      }
    },
  },
};

export default DockerInstaller;
