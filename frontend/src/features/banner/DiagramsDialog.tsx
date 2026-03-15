import { Button, Dialog, DialogBody, DialogFooter, HTMLTable, Icon, Menu, MenuItem, NonIdealState, Popover, Spinner } from "@blueprintjs/core";
import { More } from "@blueprintjs/icons";
import { useEffect } from "react";
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

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

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

    const handleSelect = async (entry: DiagramDTO) => {
        let success: boolean = true;

        if (entry.diagram_id === undefined) {
            success = false;
        } else {
            try {
                // Get diagram via thunk
                await dispatch(loadDiagram(entry.diagram_id)).unwrap();
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

    const handleDelete = async (entry: DiagramDTO) => {
        let success: boolean = true;

        if (entry.diagram_id === undefined) {
            success = false;
        } else {
            try {
                await deleteDiagramTrigger(entry.diagram_id).unwrap();
                // await dispatch(deleteDiagramServerThunk(entry.diagram_id)).unwrap();
                // refetch diagram list to update UI
                // refetchDiagrams();
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

    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Open a diagram"
            style={{ width: "700px", height: "600px" }}
        >
            <DialogBody style={{ padding: "8px", overflowY: "auto" }}>
                {!isLoading && <HTMLTable bordered striped interactive style={{ width: "100%" }}>
                    <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--pt-app-background-color, #fff)" }}>
                        <tr>
                            <th>Name</th>
                            <th>Date Modified</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.diagrams?.map((entry, i) => (
                            <tr
                                key={`${entry.diagram_id + Math.random().toString()}`}
                                onClick={() => handleSelect(entry)}
                                style={{ cursor: "pointer" }}
                            >
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>{entry.name}</td>
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>today</td>
                                <td onClick={(c) => {
                                    c.preventDefault()
                                    c.stopPropagation()
                                }}
                                    style={{ paddingTop: 4, paddingBottom: 4, width: "16px" }}>
                                    <Popover
                                        minimal={true}
                                        interactionKind="click"
                                        placement="bottom-start"
                                        content={
                                            <Menu>
                                                <MenuItem icon="trash" onClick={() => handleDelete(entry)}
                                                    intent="danger" text="Delete" />
                                            </Menu>
                                        }
                                        renderTarget={({ isOpen, ...targetProps }) => (
                                            <Icon {...targetProps} size={16}
                                                icon="more" />
                                        )}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </HTMLTable>}

                <div>
                    {data?.diagrams?.length == 0 &&
                        <NonIdealState description="No diagrams saved" icon={<More></More>}></NonIdealState>}

                    {data?.diagrams?.length != 0 && isLoading && <>
                        <div style={{
                        }}>
                            <NonIdealState description="Loading diagrams" icon={<Spinner></Spinner>}></NonIdealState>
                        </div>
                    </>}
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
