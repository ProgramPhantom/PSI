export type DiagramSource = "server" | "local";

export interface IDiagramMetadata {
    UUID: string;
    title: string;
    fileName: string;
    diagramName?: string; // Kept for server upload endpoint compatibility
    dateCreated: string;
    institution?: string;
    originalAuthor?: string;

    format?: string;
    version?: number;
    source?: DiagramSource;
}
