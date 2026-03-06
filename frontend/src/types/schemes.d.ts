export type SchemeSource = "builtin" | "local" | "server"

export type SchemeMetadata = {
    name: string,
    id: string,
    format: string
}
export type IScheme = {
    metadata: SchemeMetadata,
    components: Record<ID, IVisual>,
    associatedAssets: string[]
};
export type SchemeDict = Record<ID, { scheme: IScheme, location: SchemeSource }>;