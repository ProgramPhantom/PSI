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
import React from "react";
import { IUserSchemeData } from "../../logic/default";
import ENGINE from "../../logic/engine";
import SVGUploadList from "../SVGUploadList";
import UploadArea from "../UploadArea";
import { appToaster } from "../../app/Toaster";

interface AddSchemeDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSchemeCreated: () => void;
}

const AddSchemeDialog: React.FC<AddSchemeDialogProps> = ({isOpen, onClose, onSchemeCreated}) => {
	const [newSchemeName, setNewSchemeName] = React.useState("");
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const [uploadedSchemeData, setUploadedSchemeData] = React.useState<IUserSchemeData | null>(
		null
	);
	const [svgUploads, setSvgUploads] = React.useState<Record<string, string>>({});

	const resetState = () => {
		setNewSchemeName("");
		setSelectedFile(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		setUploadedSchemeData(null);
		setSvgUploads({});
	};

	const handleClose = () => {
		resetState();
		onClose();
	};

	const handleFileSelect = (file: File) => {
		if (file.type === "application/json" || file.name.endsWith(".json")) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const schemeData = JSON.parse(e.target?.result as string) as IUserSchemeData;
					setUploadedSchemeData(schemeData);
					setSvgUploads({});
				} catch (error) {
					console.error(error);
					setUploadedSchemeData(null);
					setSvgUploads({});
					appToaster.show({
						message: "Invalid JSON file format. Please select a valid scheme file.",
						intent: "danger"
					});
				}
			};
			reader.readAsText(file);
		} else {
			appToaster.show({
				message: "Please select a JSON file",
				intent: "warning"
			});
		}
	};

	const removeFile = () => {
		setSelectedFile(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		setUploadedSchemeData(null);
		setSvgUploads({});
	};

	// Check if svgDataRef is in SchemeManager or list of uploads
	const isSvgRefSatisfied = (svgRef: string): boolean => {
		if (ENGINE.schemeManager.allSVGDataRefs.includes(svgRef) === true) {
			return true;
		} // Scheme Manager
		if (Object.prototype.hasOwnProperty.call(svgUploads, svgRef)) {
			return true;
		} // Uploads
		return false;
	};
	const requiredSvgRefs: string[] = React.useMemo(() => {
		if (!uploadedSchemeData?.svgElements) return [];
		const refs = new Set<string>();
		Object.values(uploadedSchemeData.svgElements).forEach((el: any) => {
			if (el?.svgDataRef) refs.add(el.svgDataRef);
		});
		return Array.from(refs);
	}, [uploadedSchemeData]);

	const allSvgsSatisfied: boolean =
		requiredSvgRefs.length === 0 || requiredSvgRefs.every((r) => isSvgRefSatisfied(r));

	const handleSubmit = () => {
		if (
			!newSchemeName.trim()
			|| ENGINE.schemeManager.allSchemeNames.includes(newSchemeName.trim())
		)
			return;
		if (selectedFile && uploadedSchemeData) {
			try {
				ENGINE.addScheme(newSchemeName.trim(), uploadedSchemeData);
				onSchemeCreated();
				handleClose();
				appToaster.show({
					message: "Scheme created successfully from JSON file",
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
			ENGINE.addBlankScheme(newSchemeName.trim());
			onSchemeCreated();
			handleClose();
		}
	};

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
						|| ENGINE.schemeManager.allSchemeNames.includes(newSchemeName.trim())
							? "danger"
							: "primary"
					}
					helperText={
						!newSchemeName.trim()
							? "Cannot be empty"
							: ENGINE.schemeManager.allSchemeNames.includes(newSchemeName.trim())
								? "Cannot have duplicate names"
								: undefined
					}>
					<InputGroup
						intent={
							!newSchemeName.trim()
							|| ENGINE.schemeManager.allSchemeNames.includes(newSchemeName.trim())
								? "danger"
								: "primary"
						}
						value={newSchemeName}
						onChange={(e) => setNewSchemeName(e.target.value)}
						placeholder="Scheme name"
						style={{marginTop: "8px"}}
					/>
				</FormGroup>

				<Divider style={{margin: "16px 0"}} />

				<Text style={{marginBottom: "12px"}}>
					Optionally upload a JSON file to populate the scheme:
				</Text>

				<UploadArea
					selectedFile={selectedFile}
					onFileSelected={handleFileSelect}
					onRemoveFile={removeFile}
					accept={".json"}
					promptText={"Drag and drop a JSON scheme file here, or"}
					buttonText={"Choose File"}
					setInputRef={(el) => {
						if (fileInputRef) (fileInputRef as any).current = el;
					}}
				/>

				{uploadedSchemeData?.svgElements && (
					<SVGUploadList
						title={"SVG requirements"}
						elements={Object.entries(uploadedSchemeData.svgElements).map(
							([name, el]) => ({
								name,
								element: el as any
							})
						)}
						uploads={svgUploads}
						setUploads={setSvgUploads}
					/>
				)}
				{uploadedSchemeData?.svgElements && !allSvgsSatisfied && (
					<Text style={{color: "#a82a2a", marginTop: 8}}>
						Please upload missing SVG files before creating the scheme.
					</Text>
				)}
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
								|| ENGINE.schemeManager.allSchemeNames.includes(
									newSchemeName.trim()
								)
								|| (!!uploadedSchemeData?.svgElements && !allSvgsSatisfied)
							}
						/>
					</>
				}
			/>
		</Dialog>
	);
};

export default AddSchemeDialog;
