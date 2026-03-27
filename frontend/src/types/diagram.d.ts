export type DiagramSource = "server" | "local";

export interface IDiagramMetadata {
    UUID: string;
    diagramName: string;
    dateCreated: string;
    institution?: string;
    originalAuthor?: string;

    format?: string;
    version?: number;
    source?: DiagramSource;
}
