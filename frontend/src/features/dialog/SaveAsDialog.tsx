import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectCurrentTitle } from "../../redux/selectors/diagramSelectors";
import { setTitle } from "../../redux/slices/diagramSlice";
import { saveDiagram } from "../../redux/thunks/diagramThunks";

export interface ISaveAsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SaveAsDialog(props: ISaveAsDialogProps) {
    const currentTitle = useAppSelector(selectCurrentTitle);
    const [name, setName] = useState(currentTitle);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (props.isOpen) {
            setName(currentTitle);
        }
    }, [props.isOpen, currentTitle]);

    const handleSave = () => {
        const trimmedTitle = name.trim() || "Untitled";
        dispatch(setTitle(trimmedTitle));
        dispatch(saveDiagram({ title: trimmedTitle, fileName: `${trimmedTitle}.nmrd` }));
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
                    label="Title"
                    labelFor="diagram-title"
                    helperText="Enter a title for this diagram"
                >
                    <InputGroup
                        id="diagram-title"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSave();
                            }
                        }}
                        placeholder="e.g. My Diagram"
                        autoFocus={true}
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
