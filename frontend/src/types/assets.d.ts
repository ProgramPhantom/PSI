export interface IAsset {
    reference: string;
    dependencies: ID[];
    size: number;
    status: "loaded" | "missing"
    id: string,
}

export type AssetDict = Record<ID, IAsset>;
