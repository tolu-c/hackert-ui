export const PACKAGES = ["core", "ui", "form", "hooks", "utils"] as const;
export type PackageId = (typeof PACKAGES)[number];

export const MANAGERS = ["pnpm", "yarn", "npm"] as const;
export type Manager = (typeof MANAGERS)[number];

const ADD_COMMAND: Readonly<Record<Manager, string>> = {
  pnpm: "pnpm add",
  yarn: "yarn add",
  npm: "npm install",
};

// Mirrors each package.json's @hackert-ui/* peerDependencies.
export const PEERS: Readonly<Record<PackageId, readonly PackageId[]>> = {
  core: [],
  ui: ["core", "utils"],
  form: ["core", "ui", "utils"],
  hooks: [],
  utils: [],
};

// Peers outside the @hackert-ui scope; Yarn and npm do not install them for you.
const EXTERNAL_PEERS: Readonly<Record<PackageId, readonly string[]>> = {
  core: [],
  ui: [],
  form: ["@tanstack/react-form"],
  hooks: [],
  utils: [],
};

export function resolvePackages(selected: readonly PackageId[]): PackageId[] {
  const wanted = new Set(selected.flatMap((id) => [id, ...PEERS[id]]));
  return PACKAGES.filter((id) => wanted.has(id));
}

export type PackageName = `@hackert-ui/${PackageId}`;

export function packageId(name: PackageName): PackageId {
  return name.slice("@hackert-ui/".length) as PackageId;
}

export function installCommand(manager: Manager, selected: readonly PackageId[]): string {
  const names = resolvePackages(selected).map((id) => `@hackert-ui/${id}`);
  const external = resolvePackages(selected).flatMap((id) => EXTERNAL_PEERS[id]);
  return `${ADD_COMMAND[manager]} ${[...names, ...external].join(" ")}`;
}
