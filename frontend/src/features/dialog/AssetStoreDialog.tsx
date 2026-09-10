import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    HTMLTable,
    Icon,
    IconName,
    InputGroup,
    NonIdealState,
    Tooltip
} from "@blueprintjs/core";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { appToaster } from "../../app/Toaster";
import ENGINE from "../../logic/engine";
import { useAppDispatch } from "../../redux/hooks";
import { selectAssets } from "../../redux/slices/assetSlice";
import { loadAsset } from "../../redux/thunks/assetThunks";
import UploadArea from "../UploadArea";
import { SimpleField } from "../form/fields/SimpleField";
import fieldStyles from "../form/styles/FormFields.module.scss";

export interface IAssetStoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedAssetId?: string;
    onSelect?: (asset: { id: string; ref: string }) => void;
}

const ICONS: Record<string, IconName> = {
    "builtin": "target",
    "server": "cloud",
    "local": "geofence",
    "diagram": "draw"
};

export function AssetStoreDialog(props: IAssetStoreDialogProps) {
    const assets = useSelector(selectAssets);
    const assetList = Object.values(assets);
    const dispatch = useAppDispatch();

    const [selectedId, setSelectedId] = useState<string | null>(props.selectedAssetId ?? null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [svgReference, setSvgReference] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync selectedId when dialog opens or selectedAssetId changes
    useEffect(() => {
        if (props.isOpen) {
            if (props.selectedAssetId && assets[props.selectedAssetId]) {
                setSelectedId(props.selectedAssetId);
            } else if (!selectedId && assetList.length > 0) {
                setSelectedId(assetList[0].id);
            }
        }
    }, [props.isOpen, props.selectedAssetId]);

    // Keep selection valid if asset list updates
    useEffect(() => {
        if (selectedId && !assets[selectedId] && assetList.length > 0) {
            setSelectedId(assetList[0].id);
        } else if (!selectedId && assetList.length > 0) {
            setSelectedId(assetList[0].id);
        }
    }, [assets]);

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
        props.onClose();
    };

    const handleUploadSVG = async () => {
        if (selectedFile && svgReference.trim()) {
            try {
                const actionResult = await dispatch(loadAsset({
                    file: selectedFile,
                    reference: svgReference.trim(),
                    source: "local"
                }));

                if (loadAsset.fulfilled.match(actionResult)) {
                    appToaster.show({
                        message: "SVG uploaded successfully",
                        intent: "success"
                    });

                    // Compute sha or select by newly added ref
                    const fileText = await selectedFile.text();
                    // We can find matching asset in store or wait for next render
                    removeFile();
                    setSvgReference("");
                }
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

    const handleConfirmSelect = () => {
        if (!selectedId || !props.onSelect) return;
        const selectedAsset = assets[selectedId];
        const ref = selectedAsset?.reference || ENGINE.svgDict[selectedId]?.ref || "";
        props.onSelect({ id: selectedId, ref });
    };

    // Get SVG markup for preview, ensuring it scales and fits properly
    const previewSvgMarkup = React.useMemo(() => {
        if (!selectedId || !ENGINE.svgDict[selectedId]) return null;
        try {
            const rawSvg = ENGINE.svgDict[selectedId].object.svg();
            const parser = new DOMParser();
            const doc = parser.parseFromString(rawSvg, "image/svg+xml");
            const svgEl = doc.querySelector("svg");
            if (!svgEl) return rawSvg;

            // If viewBox is missing, infer it from width and height
            const widthAttr = svgEl.getAttribute("width");
            const heightAttr = svgEl.getAttribute("height");
            const viewBoxAttr = svgEl.getAttribute("viewBox");

            if (!viewBoxAttr && widthAttr && heightAttr) {
                const w = parseFloat(widthAttr);
                const h = parseFloat(heightAttr);
                if (!isNaN(w) && !isNaN(h)) {
                    svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
                }
            }

            // Ensure preserveAspectRatio maintains centering and containment
            if (!svgEl.getAttribute("preserveAspectRatio")) {
                svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
            }

            // Make SVG responsive within its container
            svgEl.setAttribute("width", "100%");
            svgEl.setAttribute("height", "100%");
            svgEl.style.maxWidth = "100%";
            svgEl.style.maxHeight = "100%";
            svgEl.style.display = "block";

            return svgEl.outerHTML;
        } catch (e) {
            console.error("Failed to process preview SVG", e);
            return ENGINE.svgDict[selectedId]?.object.svg() ?? null;
        }
    }, [selectedId]);

    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={handleClose}
            title={props.onSelect ? "Select SVG Asset" : "Assets"}
            style={{ width: "920px", height: "640px", maxWidth: "95vw" }}
        >
            <DialogBody style={{ padding: "12px", overflow: "hidden", display: "flex", gap: "16px", height: "100%" }}>
                {/* Left Column: Asset Table */}
                <div style={{ flex: "1 1 55%", display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
                    <div style={{ flex: 1, overflowY: "auto", border: "1px solid var(--pt-divider-black, rgba(16, 22, 26, 0.15))", borderRadius: "4px" }}>
                        {assetList.length > 0 ? (
                            <HTMLTable bordered striped interactive style={{ width: "100%", margin: 0 }}>
                                <thead style={{ position: "sticky", top: 0, zIndex: 2, background: "var(--pt-app-background-color, #fff)" }}>
                                    <tr>
                                        <th>Reference</th>
                                        <th style={{ width: "80px" }}>Size</th>
                                        <th style={{ width: "40px", textAlign: "center" }}>Src</th>
                                        <th style={{ width: "40px", textAlign: "center" }}>Deps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetList.map((asset) => {
                                        const isSelected = asset.id === selectedId;
                                        return (
                                            <tr
                                                key={asset.id}
                                                onClick={() => setSelectedId(asset.id)}
                                                style={{
                                                    cursor: "pointer",
                                                    backgroundColor: isSelected ? "rgba(19, 124, 189, 0.15)" : undefined,
                                                    outline: isSelected ? "1px solid #137cbd" : undefined
                                                }}
                                            >
                                                <td style={{ paddingTop: 6, paddingBottom: 6, fontWeight: isSelected ? 600 : 400 }}>
                                                    {asset.reference}
                                                </td>
                                                <td style={{ paddingTop: 6, paddingBottom: 6 }}>
                                                    {asset.size ? `${(asset.size / 1024).toFixed(1)} KB` : "-"}
                                                </td>
                                                <td style={{ paddingTop: 6, paddingBottom: 6, textAlign: "center" }}>
                                                    <Tooltip content={asset.source} placement="bottom">
                                                        <Icon icon={ICONS[asset.source]} size={16} style={{ cursor: "help" }} />
                                                    </Tooltip>
                                                </td>
                                                <td style={{ paddingTop: 6, paddingBottom: 6, textAlign: "center" }}>
                                                    <Tooltip
                                                        content={
                                                            <div>
                                                                <strong>Dependants:</strong>
                                                                <br />
                                                                {asset.dependents.length > 0
                                                                    ? asset.dependents.join(", ")
                                                                    : "None"}
                                                            </div>
                                                        }
                                                        placement="bottom"
                                                    >
                                                        <Icon icon={"info-sign"} size={16} style={{ cursor: "help" }} />
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </HTMLTable>
                        ) : (
                            <NonIdealState
                                description="No assets loaded in the store."
                                icon="database"
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Preview & Upload Area */}
                <div style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", gap: "10px", minWidth: 0, height: "100%", overflow: "hidden" }}>
                    {/* SVG Preview Section */}
                    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, border: "1px solid var(--pt-divider-black, rgba(16, 22, 26, 0.15))", borderRadius: "6px", padding: "8px", background: "var(--pt-app-background-color, #fff)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.9em" }}>Preview</span>
                            {selectedId && assets[selectedId] && (
                                <span style={{ fontSize: "0.8em", color: "var(--pt-text-color-muted, #5c7080)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px", whiteSpace: "nowrap" }}>
                                    {assets[selectedId].reference}
                                </span>
                            )}
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: "160px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f5f8fa",
                                backgroundImage: `
                                    linear-gradient(45deg, #e1e8ed 25%, transparent 25%),
                                    linear-gradient(-45deg, #e1e8ed 25%, transparent 25%),
                                    linear-gradient(45deg, transparent 75%, #e1e8ed 75%),
                                    linear-gradient(-45deg, transparent 75%, #e1e8ed 75%)
                                `,
                                backgroundSize: "16px 16px",
                                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                                borderRadius: "4px",
                                border: "1px solid rgba(16, 22, 26, 0.1)",
                                overflow: "hidden",
                                padding: "8px"
                            }}
                        >
                            {previewSvgMarkup ? (
                                <div
                                    style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    dangerouslySetInnerHTML={{ __html: previewSvgMarkup }}
                                />
                            ) : (
                                <div style={{ color: "var(--pt-text-color-muted, #5c7080)", fontSize: "0.85em", textAlign: "center" }}>
                                    {selectedId ? "No preview available for this asset" : "Select an asset to preview"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SVG Upload Area Section */}
                    <div style={{ display: "flex", flexDirection: "column", flex: "1 1 0", minHeight: 0, border: "1px solid var(--pt-divider-black, rgba(16, 22, 26, 0.15))", borderRadius: "6px", padding: "10px", background: "var(--pt-app-background-color, #fff)" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9em", marginBottom: "8px" }}>Upload SVG</div>

                        <SimpleField style={{ margin: "4px 0 6px 0" }}
                            labelFor="reference-input"
                            intent={selectedFile && svgReference.trim() === "" ? "danger" : "none"}
                            helperText={selectedFile && svgReference.trim() === "" ? "Enter reference" : ""}
                        >
                            <InputGroup
                                id="reference-input"
                                value={svgReference}
                                className={fieldStyles.compactInputGroup}
                                intent={selectedFile && svgReference.trim() === "" ? "danger" : "none"}
                                onChange={(e) => setSvgReference(e.target.value)}
                                placeholder="Enter reference name..."
                            />
                        </SimpleField>

                        <UploadArea
                            selectedFile={selectedFile}
                            onFileSelected={handleFileSelect}
                            onRemoveFile={removeFile}
                            accept={".svg"}
                            promptText={"Drag and drop SVG file here, or"}
                            buttonText={"Choose File"}
                            setInputRef={(el) => {
                                if (fileInputRef) (fileInputRef as any).current = el;
                            }}
                            style={{ flex: "1 1 0", minHeight: "60px", height: "100%", padding: "12px 8px" }}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", flexShrink: 0 }}>
                            <Button
                                text="Upload"
                                intent="primary"
                                icon="upload"
                                onClick={handleUploadSVG}
                                disabled={!selectedFile || !svgReference.trim()}
                            />
                        </div>
                    </div>
                </div>
            </DialogBody>

            <DialogFooter
                actions={
                    <>
                        <Button text={props.onSelect ? "Cancel" : "Close"} onClick={handleClose} />
                        {props.onSelect && (
                            <Button
                                text="Select"
                                intent="primary"
                                icon="tick"
                                onClick={handleConfirmSelect}
                                disabled={!selectedId || !assets[selectedId]}
                            />
                        )}
                    </>
                }
            />
        </Dialog>
    );
}
