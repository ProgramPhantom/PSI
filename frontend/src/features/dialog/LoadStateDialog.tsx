import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { useRef, useState } from "react";
import UploadArea from "../UploadArea";
import { appToaster } from "../../app/Toaster";
import { useAppDispatch } from "../../redux/hooks";
import { openDiagram } from "../../redux/thunks/diagramThunks";

export interface ILoadStateDialogProps {
	close: () => void;
	isOpen: boolean;
}

export function LoadStateDialog(props: ILoadStateDialogProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dispatch = useAppDispatch();

	const handleFileSelect = (file: File) => {
		if (file.name.endsWith(".nmrd")) {
			setSelectedFile(file);
		} else {
			appToaster.show({
				message: "Please select an NMRD diagram file",
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

	const handleLoadFile = () => {
		if (selectedFile) {
			dispatch(openDiagram(selectedFile)).then(() => {
			    props.close();
			    setSelectedFile(null);
			});
		}
	};

	return (
		<>
			<Dialog
				isOpen={props.isOpen}
				onClose={() => {
					props.close();
					setSelectedFile(null);
				}}
				title="Load Diagram File"
				icon="upload">
				<DialogBody>
					<UploadArea
						selectedFile={selectedFile}
						onFileSelected={handleFileSelect}
						onRemoveFile={removeFile}
						accept={".nmrd"}
						promptText={"Drag and drop an NMRD diagram file here, or"}
						buttonText={"Choose File"}
						setInputRef={(el) => {
							if (fileInputRef) (fileInputRef as any).current = el;
						}}
					/>
				</DialogBody>

				<DialogFooter
					actions={
						<>
							<Button
								text="Cancel"
								onClick={() => {
									props.close();
									setSelectedFile(null);
								}}
							/>
							<Button
								text="Load"
								intent="primary"
								onClick={handleLoadFile}
								disabled={!selectedFile}
							/>
						</>
					}
				/>
			</Dialog>
		</>
	);
}
