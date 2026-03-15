export interface IAsset {
    reference: string;
    dependents: ID[];
    size: number;
    status: "loaded" | "missing"
    id: string,
    source: AssetSource
}

export type AssetDict = Record<ID, IAsset>;
export type AssetSource = "builtin" | "local" | "server" | "diagram"