import {
    Button,
    Callout,
    ControlGroup,
    Switch
} from "@blueprintjs/core";
import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ENGINE from "../../logic/engine";
import VisualForm from "./VisualForm";
import { FormRequirements } from "./FormBase";
import { AssetStoreDialog } from "../dialog/AssetStoreDialog";
import { DoubleField } from "./fields/DoubleField";
import styles from "./styles/FormContainers.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

interface ISVGElementFormProps extends FormRequirements { }

const SVGElementForm: React.FC<ISVGElementFormProps> = (props) => {
    const fullPrefix = props.prefix !== undefined && props.prefix !== "" ? `${props.prefix}.` : "";

    const formControls = useFormContext();

    const [isAssetStoreDialogOpen, setIsAssetStoreDialogOpen] = useState(false);

    return (
        <>
            {/* SVG Specific fields */}
            <ControlGroup vertical={true} className={styles.formGroupContainer}>
                <Controller
                    control={formControls.control}
                    name={`${fullPrefix}asset`}
                    render={({ field: { value, onChange } }) => {
                        const currentId = typeof value === 'object' ? value?.id : value;
                        const currentRef = typeof value === 'object' ? value?.ref : "";
                        const isMissing = !!currentId && !ENGINE.svgDict[currentId as string];

                        return (
                            <>
                                {isMissing && (
                                    <Callout intent={"warning"} title="Required Asset Missing"
                                        style={{ marginBottom: "16px", wordBreak: "break-all" }}>
                                        The required asset is missing. Reference: {currentRef || "Unknown"},
                                        ID: {currentId}.

                                        Please select an asset or upload it via the Asset Store.
                                    </Callout>
                                )}
                                <div className={styles.inlineContainer} style={{ alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        <span style={{ fontSize: "0.85em", color: "var(--pt-text-color-muted, #5c7080)" }}>Selected SVG:</span>
                                        <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={currentRef || "None"}>
                                            {currentRef || (isMissing ? "Asset missing" : "None selected")}
                                        </span>
                                    </div>
                                    <Button
                                        text="Select SVG"
                                        icon="media"
                                        onClick={() => setIsAssetStoreDialogOpen(true)}
                                    />
                                </div>

                                <AssetStoreDialog
                                    isOpen={isAssetStoreDialogOpen}
                                    onClose={() => setIsAssetStoreDialogOpen(false)}
                                    selectedAssetId={currentId}
                                    onSelect={(selectedAsset) => {
                                        onChange({ id: selectedAsset.id, ref: selectedAsset.ref });
                                        setIsAssetStoreDialogOpen(false);
                                    }}
                                />
                            </>
                        );
                    }}
                />

                {/* Flipped */}
                <DoubleField
                    label="Flipped"
                    leftLabel="X"
                    leftField={
                        <Controller
                            control={formControls.control}
                            name={`${fullPrefix}flipped.x`}
                            render={({ field }) => (
                                <Switch
                                    {...field}
                                    id="flipped-x-switch"
                                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                                    checked={Boolean(field.value)}
                                    className={fieldStyles.compactSwitch}
                                />
                            )}
                        />
                    }
                    rightLabel="Y"
                    rightField={
                        <Controller
                            control={formControls.control}
                            name={`${fullPrefix}flipped.y`}
                            render={({ field }) => (
                                <Switch
                                    {...field}
                                    id="flipped-y-switch"
                                    onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                                    checked={Boolean(field.value)}
                                    className={fieldStyles.compactSwitch}
                                />
                            )}
                        />
                    }
                />
            </ControlGroup >

            <VisualForm target={props.target} heightDisplay={true} widthDisplay={true} prefix={props.prefix}></VisualForm>
        </>
    );
};

export default SVGElementForm;
