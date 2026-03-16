import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    FormGroup,
    InputGroup
} from "@blueprintjs/core";
import React, { useRef, useState } from "react";
import { appToaster } from "../../app/Toaster";
import { useAppDispatch } from "../../redux/hooks";
import { loadAsset } from "../../redux/thunks/assetThunks";
import UploadArea from "../UploadArea";

interface ISVGUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    dependencies?: string[]
}

const SVGUploadDialog: React.FC<ISVGUploadDialogProps> = ({ isOpen, onClose, dependencies }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [svgReference, setSvgReference] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const dispatch = useAppDispatch();

    const handleFileSelect = (file: File) => {
        if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
            setSelectedFile(file);
            const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
            setSvgReference(nameWithoutExtension);
        } else {
            appToaster.show({
                message: "Please select an SVG file",
                intent: "warning"
            });
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setSvgReference("");
        onClose();
    };

    // Handle upload
    const handleUploadSVG = () => {
        if (selectedFile && svgReference.trim()) {
            try {
                dispatch(loadAsset({
                    file: selectedFile,
                    reference: svgReference.trim(),
                    dependants: dependencies,
                    source: "local"
                }));

                appToaster.show({
                    message: "SVG uploaded successfully",
                    intent: "success"
                });

                handleClose();
            } catch (error) {
                console.error(error);
                appToaster.show({
                    message: "Error uploading SVG file",
                    intent: "danger"
                });
            }
        } else {
            appToaster.show({
                message: "Please select an SVG file and provide a reference name",
                intent: "warning"
            });
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            title="Upload SVG File"
            icon="upload">
            <DialogBody>
                <FormGroup
                    label="Reference Name"
                    labelFor="reference-input"
                    intent={svgReference.trim() === "" ? "danger" : "none"}
                    helperText={svgReference.trim() === "" ? "Enter reference" : ""}>
                    <InputGroup
                        id="reference-input"
                        value={svgReference}
                        intent={svgReference.trim() === "" ? "danger" : "none"}
                        onChange={(e) => setSvgReference(e.target.value)}
                        placeholder="Enter reference name..."
                    />
                </FormGroup>

                <UploadArea
                    selectedFile={selectedFile}
                    onFileSelected={handleFileSelect}
                    onRemoveFile={removeFile}
                    accept={".svg"}
                    promptText={"Drag and drop an SVG file here, or"}
                    buttonText={"Choose File"}
                    setInputRef={(el) => {
                        if (fileInputRef) (fileInputRef as any).current = el;
                    }}
                    style={{ marginTop: "16px" }}
                />
            </DialogBody>

            <DialogFooter
                actions={
                    <>
                        <Button
                            text="Cancel"
                            onClick={handleClose}
                        />
                        <Button
                            text="Upload"
                            intent="primary"
                            onClick={handleUploadSVG}
                            disabled={!selectedFile || !svgReference.trim()}
                        />
                    </>
                }
            />
        </Dialog>
    );
};

export default SVGUploadDialog;
