export interface IAsset {
    reference: string;
    dependents: ID[];
    size: number;
    status: "loaded" | "missing"
    id: string,
    source: "builtin" | "local" | "server"
}

export type AssetDict = Record<ID, IAsset>;
export type AssetSource = "builtin" | "local" | "server"