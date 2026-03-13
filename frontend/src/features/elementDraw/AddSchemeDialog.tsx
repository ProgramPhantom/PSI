import {
	Button,
	Classes,
	Dialog,
	DialogFooter,
	Divider,
	FormGroup,
	InputGroup,
	Text
} from "@blueprintjs/core";
import React, { useMemo } from "react";
import ENGINE from "../../logic/engine";
import SVGUploadList from "../SVGUploadList";
import UploadArea from "../UploadArea";
import { appToaster } from "../../app/Toaster";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addScheme, selectSchemes } from "../../redux/slices/schemesSlice";
import JSZip from "jszip";
import { v4 as uuidv4 } from 'uuid';
import { importSchemeFile } from "../../redux/thunks/schemeThunks";
import { IScheme } from "../../types/schemes";


interface AddSchemeDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

const AddSchemeDialog: React.FC<AddSchemeDialogProps> = ({ isOpen, onClose }) => {
	const [newSchemeName, setNewSchemeName] = React.useState("");
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const schemes = useAppSelector(selectSchemes);
	const dispatch = useAppDispatch();

	const resetState = () => {
		setNewSchemeName("");
		setSelectedFile(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleClose = () => {
		resetState();
		onClose();
	};

	const handleFileSelect = async (file: File) => {
		if (file.name.endsWith(".nmrs")) {
			setSelectedFile(file);
			try {
				const zip = new JSZip();
				const unzipped = await zip.loadAsync(file);
				const manifestFile = unzipped.file("manifest.json");
				if (manifestFile) {
					const manifestStr = await manifestFile.async("text");
					const manifest = JSON.parse(manifestStr);
					if (manifest.name) {
						setNewSchemeName(manifest.name);
					}
				}
			} catch (error) {
				console.error(error);
				appToaster.show({
					message: "Invalid .nmrs file format or unreadable manifest.",
					intent: "danger"
				});
				removeFile();
			}
		} else {
			appToaster.show({
				message: "Please select an .nmrs file",
				intent: "warning"
			});
		}
	};

	const removeFile = () => {
		setSelectedFile(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};


	const handleSubmit = async () => {
		const name = newSchemeName.trim();

		if (selectedFile) {
			try {
				await dispatch(importSchemeFile({ file: selectedFile, nameOverride: name })).unwrap();
				handleClose();
				appToaster.show({
					message: "Scheme created successfully from uploaded file",
					intent: "success"
				});
			} catch (error) {
				console.error(error);
				appToaster.show({
					message: "Failed to create scheme from uploaded data.",
					intent: "danger"
				});
			}
		} else if (!selectedFile) {
			const blankScheme: IScheme = {
				metadata: { name: name, id: uuidv4(), format: "nmr-pulse-scheme" },
				associatedAssets: [],
				components: {}
			};
			dispatch(addScheme({ scheme: blankScheme }));
			handleClose();
		}
	};

	const schemeNames = useMemo(() => Object.keys(schemes), [schemes]);

	return (
		<Dialog
			isOpen={isOpen}
			onClose={handleClose}
			title="Create New Scheme"
			canOutsideClickClose={true}
			canEscapeKeyClose={true}>
			<div className={Classes.DIALOG_BODY}>
				<Text>Enter a name for the new scheme:</Text>
				<FormGroup
					intent={
						!newSchemeName.trim()
							? "danger"
							: "primary"
					}
					helperText={
						!newSchemeName.trim()
							? "Cannot be empty"
							: ""
					}>
					<InputGroup
						intent={
							!newSchemeName.trim()
								? "danger"
								: "primary"
						}
						value={newSchemeName}
						onChange={(e) => setNewSchemeName(e.target.value)}
						placeholder="Scheme name"
						style={{ marginTop: "8px" }}
					/>
				</FormGroup>

				<Divider style={{ margin: "16px 0" }} />

				<Text style={{ marginBottom: "12px" }}>
					Optionally upload an .nmrs file to populate the scheme:
				</Text>

				<UploadArea
					selectedFile={selectedFile}
					onFileSelected={handleFileSelect}
					onRemoveFile={removeFile}
					accept={".nmrs"}
					promptText={"Drag and drop an .nmrs scheme file here, or"}
					buttonText={"Choose File"}
					setInputRef={(el) => {
						if (fileInputRef) (fileInputRef as any).current = el;
					}}
				/>
			</div>

			<DialogFooter
				actions={
					<>
						<Button text="Cancel" onClick={handleClose} variant="minimal" />
						<Button
							text="Create"
							intent="primary"
							onClick={handleSubmit}
							disabled={
								!newSchemeName.trim()
							}
						/>
					</>
				}
			/>
		</Dialog>
	);
};

export default AddSchemeDialog;
