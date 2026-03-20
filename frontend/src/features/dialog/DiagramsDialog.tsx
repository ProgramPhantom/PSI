import { Button, Classes, Dialog, DialogBody, DialogFooter, HTMLTable, NonIdealState, Spinner, Section, SectionCard, SpinnerSize } from "@blueprintjs/core";
import { More } from "@blueprintjs/icons";
import { useEffect, useState } from "react";
import { appToaster } from "../../app/Toaster";
import { BLANK_DIAGRAM } from "../../logic/default/blankDiagram";
import { DEFAULT_DIAGRAM } from "../../logic/default/defaultDiagram";
import ENGINE from "../../logic/engine";
import { IDiagram } from "../../logic/hasComponents/diagram";
import { useDeleteDiagramMutation, useGetUserDiagramsQuery } from "../../redux/api/api";
import { useAppDispatch } from "../../redux/hooks";
import { loadDiagram } from "../../redux/thunks/diagramThunks";

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

interface DiagramDTO {
    name?: string | undefined,
    diagram_id?: string | undefined
}

export function DiagramsDialog(props: IDiagramsDialogProps) {
    const { data, refetch: refetchDiagrams, isLoading } = useGetUserDiagramsQuery(undefined, {
        skip: !props.isOpen,
    });

    const [deleteDiagramTrigger] = useDeleteDiagramMutation();
    const dispatch = useAppDispatch();

    const [selectedDiagram, setSelectedDiagram] = useState<DiagramDTO | null>(null);

    useEffect(() => {
        if (!props.isOpen) {
            setSelectedDiagram(null);
        }
    }, [props.isOpen]);

    const handleOpen = async () => {
        if (!selectedDiagram) return;
        let success: boolean = true;

        if (selectedDiagram.diagram_id === undefined) {
            success = false;
        } else {
            try {
                // Get diagram via thunk
                await dispatch(loadDiagram(selectedDiagram.diagram_id)).unwrap();
            } catch (err) {
                success = false
                console.error(err);
            }
        }

        if (success === false) {
            appToaster.show({
                "message": "Error loading diagram",
                "intent": "danger"
            })
        }

        props.onClose();
    };

    const handleDelete = async () => {
        if (!selectedDiagram) return;
        let success: boolean = true;

        if (selectedDiagram.diagram_id === undefined) {
            success = false;
        } else {
            try {
                await deleteDiagramTrigger(selectedDiagram.diagram_id).unwrap();
                setSelectedDiagram(null);
            } catch (error) {
                success = false;
            }
        }

        if (success === false) {
            appToaster.show({
                "message": "Failed to delete diagram",
                "intent": "danger"
            })
        }
    }

    useEffect(() => {
        if (props.isOpen) {
            refetchDiagrams();
        }
    }, [props.isOpen, refetchDiagrams])

    const renderCloudTable = () => {
        if (isLoading) {
            return (
                <div style={{ padding: "16px" }}>
                    <NonIdealState description="Loading diagrams" icon={<Spinner size={SpinnerSize.STANDARD} />} />
                </div>
            );
        }
        if (!data?.diagrams || data.diagrams.length === 0) {
            return (
                <div style={{ padding: "16px" }}>
                    <NonIdealState description="No cloud diagrams found" icon={<More />} />
                </div>)
        }
        return (
            <HTMLTable bordered striped interactive style={{ width: "100%", margin: 0, }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--pt-app-background-color, #fff)" }}>
                    <tr>
                        <th>Name</th>
                        <th>Date Modified</th>
                    </tr>
                </thead>
                <tbody>
                    {data.diagrams.map((entry, i) => {
                        const isSelected = selectedDiagram?.diagram_id === entry.diagram_id;
                        return (
                            <tr
                                key={entry.diagram_id || i}
                                onClick={() => setSelectedDiagram(entry)}
                                className={isSelected ? Classes.INTENT_PRIMARY : undefined}
                                style={{ cursor: "pointer" }}
                            >
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>{entry.name || "Untitled"}</td>
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>{entry.name}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </HTMLTable>
        );
    };

    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Open a diagram"
            style={{ width: "900px", height: "80vh" }}
        >
            <DialogBody style={{ padding: 0, display: "flex", overflow: "hidden" }}>
                {/* Left Area (Tables) */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "16px 1px 16px 16px", gap: "24px" }}>
                    <Section icon="cloud"
                        title="Cloud Diagrams"
                        collapsible={false}
                        style={{ flexShrink: 0, height: "100%" }}
                    >
                        <SectionCard style={{ padding: 0, overflow: "auto", height: "100%" }}>
                            {renderCloudTable()}
                        </SectionCard>
                    </Section>
                </div>

                {/* Right Area (Side Panel) */}
                <div style={{
                    width: "250px",
                    borderLeft: "1px solid var(--pt-divider-black)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--pt-app-background-color)"
                }}>
                    {selectedDiagram ? (
                        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <div>
                                <h4 className="bp5-heading">{selectedDiagram.name || "Untitled"}</h4>
                                <div className="bp5-text-muted bp5-text-small" style={{ marginBottom: "16px" }}>
                                    ID: {selectedDiagram.diagram_id}
                                </div>
                            </div>

                            <div style={{ flex: 1 }}></div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <Button intent="primary" fill text="Open" onClick={handleOpen} />
                                <Button intent="danger" fill text="Delete" onClick={handleDelete} />
                            </div>
                        </div>
                    ) : (
                        <NonIdealState description="Select a diagram" icon="hand-up" />
                    )}
                </div>
            </DialogBody>
            <DialogFooter
                actions={
                    <Button text="Close" onClick={props.onClose} />
                }
            />
        </Dialog>
    );
}
