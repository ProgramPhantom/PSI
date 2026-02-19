import { Button, Dialog, DialogBody, DialogFooter, HTMLTable } from "@blueprintjs/core";
import { IDiagram } from "../../logic/hasComponents/diagram";
import { ISequenceAligner } from "../../logic/hasComponents/sequenceAligner";
import ENGINE from "../../logic/engine";
import { DEFAULT_DIAGRAM } from "../../logic/default/defaultDiagram";
import { BLANK_DIAGRAM } from "../../logic/default/blankDiagram";

export interface IDiagramsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Metadata for a diagram entry in the list. */
interface IDiagramEntry {
    diagram: IDiagram;
    dateModified: string;
    owner: string;
}

const def: IDiagramEntry = {
    diagram: DEFAULT_DIAGRAM,
    dateModified: "2067-02-18",
    owner: "C-rad",
}
const blank: IDiagramEntry = {
    diagram: BLANK_DIAGRAM,
    dateModified: "2067-02-18",
    owner: "Henry",
}

const DUMMY_DIAGRAMS: IDiagramEntry[] = [
    def,
    blank
];

export function DiagramsDialog(props: IDiagramsDialogProps) {
    const handleSelect = (entry: IDiagramEntry) => {
        ENGINE.handler.constructDiagram(entry.diagram);
        props.onClose();
    };

    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Open a diagram"
            style={{ width: "700px", height: "600px" }}
        >
            <DialogBody style={{ padding: "8px", overflowY: "auto" }}>
                <HTMLTable bordered striped interactive style={{ width: "100%" }}>
                    <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--pt-app-background-color, #fff)" }}>
                        <tr>
                            <th>Name</th>
                            <th>Date Modified</th>
                            <th>Owner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DUMMY_DIAGRAMS.map((entry) => (
                            <tr
                                key={`${entry.diagram.id + Math.random().toString()}`}
                                onClick={() => handleSelect(entry)}
                                style={{ cursor: "pointer" }}
                            >
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>{entry.diagram.ref}</td>
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>{entry.dateModified}</td>
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>{entry.owner}</td>
                            </tr>
                        ))}
                    </tbody>
                </HTMLTable>
            </DialogBody>
            <DialogFooter
                actions={
                    <Button text="Close" onClick={props.onClose} />
                }
            />
        </Dialog>
    );
}
