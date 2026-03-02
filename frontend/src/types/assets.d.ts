export interface IAsset {
    reference: string;
    author: string;
    dateCreated: string; // Using user-requested name "dataCreated"
    dependencies: ID[];
    size: number;
    status: "loaded" | "missing"
    id: string,
}

export type AssetDict = Record<ID, IAsset>;
