import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectCurrentFileName } from "../../redux/selectors/diagramSelectors";
import { saveDiagram } from "../../redux/thunks/diagramThunks";

export interface ISaveAsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SaveAsDialog(props: ISaveAsDialogProps) {
    const fileName = useAppSelector(selectCurrentFileName);
    const [name, setName] = useState(fileName);
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (props.isOpen) {
            setName(fileName);
        }
    }, [props.isOpen, fileName]);

    const handleSave = () => {
        dispatch(saveDiagram({fileName: name}))
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
                    label="Diagram Name"
                    labelFor="diagram-name"
                    helperText="Enter a name for this diagram"
                >
                    <InputGroup
                        id="diagram-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
