import { Button, Dialog, DialogBody, DialogFooter, HTMLTable, NonIdealState, Spinner } from "@blueprintjs/core";
import Diagram, { IDiagram } from "../../logic/hasComponents/diagram";
import { ISequenceAligner } from "../../logic/hasComponents/sequenceAligner";
import ENGINE from "../../logic/engine";
import { DEFAULT_DIAGRAM } from "../../logic/default/defaultDiagram";
import { BLANK_DIAGRAM } from "../../logic/default/blankDiagram";
import { getDiagram, getUserDiagrams } from "../../logic/api";
import { useEffect, useState } from "react";
import { More } from "@blueprintjs/icons";
import { appToaster } from "../../app/Toaster";

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
    const handleSelect = (entry: DiagramDTO) => {
        //ENGINE.handler.constructDiagram(entry.diagram);

        let success: boolean = true;
        if (entry.diagram_id === undefined) {
            success = false;
        } else {
            // Get diagram
            getDiagram(entry.diagram_id).then((response) => {
                if (response.error) {
                    success = false;
                    return
                }
                let diagramString: string | undefined = response.data?.data;

                if (diagramString === undefined) {
                    success = false
                    return
                }


                try {
                    let diagramData: IDiagram = JSON.parse(diagramString); 

                    ENGINE.handler.constructDiagram(diagramData)
                } catch (err) {
                    success = false
                }
            })
        }

        if (success === false) {
            appToaster.show({
                "message": "Error loading diagram",
                "intent": "danger"
            })
        }

        props.onClose();
    };

    const [diagramList, setDiagramList] = useState<DiagramDTO[]>([])
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        console.log("fetching data")
        getUserDiagrams().then((response) => {
        if (response.error) {
            setIsLoaded(false)
            return
        }
        let data: DiagramDTO[] = response.data?.diagrams?.filter(d => d !== undefined) ?? []
        setDiagramList(data);
        console.log(`Set diagram ids ${data}`)
        setIsLoaded(true)
    }
    );
    }, [props.isOpen])


    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Open a diagram"
            style={{ width: "700px", height: "600px" }}
        >
            <DialogBody style={{ padding: "8px", overflowY: "auto" }}>
                {isLoaded && <HTMLTable bordered striped interactive style={{ width: "100%" }}>
                    <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--pt-app-background-color, #fff)" }}>
                        <tr>
                            <th>Name</th>
                            <th>Date Modified</th>
                            <th>Owner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {diagramList.map((entry, i) => (
                            <tr
                                key={`${entry.diagram_id + Math.random().toString()}`}
                                onClick={() => handleSelect(entry)}
                                style={{ cursor: "pointer" }}
                            >
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>{entry.name}</td>
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>today</td>
                                <td style={{ paddingTop: 4, paddingBottom: 4 }}>Owner</td>
                            </tr>
                        ))}
                    </tbody>
                </HTMLTable>}

                <div>
                    {diagramList.length == 0 && 
                <NonIdealState description="No diagrams saved" icon={<More></More>}></NonIdealState>}

                {!isLoaded && diagramList.length != 0 && <>
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
