import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { appToaster } from "../../app/Toaster";
import ENGINE from "../../logic/engine";
import { useDispatch } from "react-redux";
import { useAppDispatch } from "../../redux/hooks";
import { saveDiagramAs } from "../../redux/thunks/diagramThunks";

export interface ISaveAsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SaveAsDialog(props: ISaveAsDialogProps) {
    const [ref, setRef] = useState(ENGINE.handler.diagram.ref);
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (props.isOpen) {
            setRef(ENGINE.handler.diagram.ref);
        }
    }, [props.isOpen]);

    const handleSave = () => {
        ENGINE.handler.diagram.ref = ref;
        dispatch(saveDiagramAs())
        props.onClose();
    };

    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Save As"
            style={{ width: "400px" }}
        >
            <DialogBody>
                <FormGroup
                    label="Diagram Reference"
                    labelFor="diagram-ref"
                    helperText="Enter a name for this diagram reference"
                >
                    <InputGroup
                        id="diagram-ref"
                        value={ref}
                        onChange={(e) => setRef(e.target.value)}
                        placeholder="e.g. My Diagram"
                    />
                </FormGroup>
            </DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button text="Cancel" onClick={props.onClose} />
                        <Button intent="primary" text="Save" onClick={handleSave} />
                    </>
                }
            />
        </Dialog>
    );
}
