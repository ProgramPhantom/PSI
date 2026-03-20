export type DiagramSource = "server" | "local";

export interface IDiagramMetadata {
    format?: string;
    version?: number;
    UUID: string;
    source: DiagramSource;
    diagramName: string;
    institution?: string;
    originalAuthor?: string;
    dateCreated: string;
}
