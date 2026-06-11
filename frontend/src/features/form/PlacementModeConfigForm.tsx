import {
    Card,
    ControlGroup,
    FormGroup,
    HTMLSelect,
    NumericInput,
    Switch
} from "@blueprintjs/core";
import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import styles from "./styles/FormGroup.module.scss";
import fieldStyles from "./styles/FormFields.module.scss";

export const PlacementModeConfig: React.FC<{ fullPrefix: string }> = ({ fullPrefix }) => {
    const { control } = useFormContext();
    const type = useWatch({
        control,
        name: `${fullPrefix}placementMode.type`
    });
    const placementMode = useWatch({
        control,
        name: `${fullPrefix}placementMode`
    });
    const placementControl = useWatch({
        control,
        name: `${fullPrefix}placementControl`
    });
    const pulseData = useWatch({
        control,
        name: `${fullPrefix}pulseData`
    });

    let details: React.ReactNode;
    let coreRow: React.ReactNode = (
        <>
            <Card style={{ marginTop: "8px", padding: 0, display: "flex", flexDirection: "row" }}>
                <div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
                    Type: {type}
                </div>
                <div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
                    Control: {placementControl}
                </div>
            </Card>
        </>
    );


    if (pulseData) {
        details = (
            <>

                {/* Read-only fields */}
                <Card style={{
                    padding: "4px 8px",
                    fontSize: "0.8em", opacity: 0.7,
                    display: "flex", justifyContent: "space-between"
                }}>
                    <span>Index: {pulseData?.index ?? "-"}</span>
                    <span>ChannelID: {pulseData?.channelID ?? "-"}</span>
                    <span>SequenceID: {pulseData?.sequenceID ?? "-"}</span>
                </Card >

                <FormGroup className={styles.simpleGroup} label="Orientation">
                    <Controller
                        control={control}
                        name={`${fullPrefix}pulseData.orientation`}
                        defaultValue="top"
                        render={({ field }) => (
                            <HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="both">Both</option>
                            </HTMLSelect>
                        )}
                    />
                </FormGroup>

                <FormGroup className={styles.doubleGroup} label="Align">
                    <div className={styles.doubleFields}>
                        <div className={styles.inlineField}>
                            <span className={styles.fieldLabel}>X</span>
                            <Controller
                                control={control}
                                name={`${fullPrefix}pulseData.alignment.x`}
                                defaultValue="here"
                                render={({ field }) => (
                                    <HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
                                        <option value="here">Left</option>
                                        <option value="centre">Centre</option>
                                        <option value="far">Right</option>
                                    </HTMLSelect>
                                )}
                            />
                        </div>
                        <div className={styles.inlineField}>
                            <span className={styles.fieldLabel}>Y</span>
                            <Controller
                                control={control}
                                name={`${fullPrefix}pulseData.alignment.y`}
                                defaultValue="here"
                                render={({ field }) => (
                                    <HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
                                        <option value="here">Top</option>
                                        <option value="centre">Centre</option>
                                        <option value="far">Bottom</option>
                                    </HTMLSelect>
                                )}
                            />
                        </div>
                    </div>
                </FormGroup>

                <FormGroup className={styles.simpleGroup} label="No. Sections">
                    <Controller
                        control={control}
                        name={`${fullPrefix}pulseData.noSections`}
                        defaultValue={1}
                        render={({ field }) => (
                            <NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={1} max={10} size="small" fill />
                        )}
                    />
                </FormGroup>

                <FormGroup className={styles.simpleGroup} inline label="Clip Channel Bar">
                    <Controller
                        control={control}
                        name={`${fullPrefix}pulseData.clipBar`}
                        render={({ field }) => (
                            <Switch {...field} onChange={field.onChange} checked={field.value} className={fieldStyles.compactSwitch} />
                        )}
                    />
                </FormGroup>
            </>
        );
    } else if (type === "grid") {
        details = (
            <>
                <div className={styles.inlineContainer}>
                    <FormGroup className={styles.simpleGroup} label="Row">
                        <Controller
                            control={control}
                            name={`${fullPrefix}placementMode.gridConfig.coords.row`}
                            defaultValue={0}
                            render={({ field }) => (
                                <NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={0} size="small" fill />
                            )}
                        />
                    </FormGroup>
                    <FormGroup className={styles.simpleGroup} label="Col">
                        <Controller
                            control={control}
                            name={`${fullPrefix}placementMode.gridConfig.coords.col`}
                            defaultValue={0}
                            render={({ field }) => (
                                <NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={0} size="small" fill />
                            )}
                        />
                    </FormGroup>
                </div>

                <div className={styles.inlineContainer}>
                    <FormGroup className={styles.simpleGroup} label="Row Span">
                        <Controller
                            control={control}
                            name={`${fullPrefix}placementMode.gridConfig.gridSize.noRows`}
                            defaultValue={1}
                            render={({ field }) => (
                                <NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={1} size="small" fill />
                            )}
                        />
                    </FormGroup>
                    <FormGroup className={styles.simpleGroup} label="Col Span">
                        <Controller
                            control={control}
                            name={`${fullPrefix}placementMode.gridConfig.gridSize.noCols`}
                            defaultValue={1}
                            render={({ field }) => (
                                <NumericInput {...field} className={fieldStyles.compactNumericInput} onValueChange={field.onChange} min={1} size="small" fill />
                            )}
                        />
                    </FormGroup>
                </div>

                <FormGroup className={styles.doubleGroup} label="Align">
                    <div className={styles.doubleFields}>
                        <div className={styles.inlineField}>
                            <span className={styles.fieldLabel}>X</span>
                            <Controller
                                control={control}
                                name={`${fullPrefix}placementMode.gridConfig.alignment.x`}
                                defaultValue="here"
                                render={({ field }) => (
                                    <HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
                                        <option value="here">Here</option>
                                        <option value="centre">Centre</option>
                                        <option value="far">Far</option>
                                    </HTMLSelect>
                                )}
                            />
                        </div>
                        <div className={styles.inlineField}>
                            <span className={styles.fieldLabel}>Y</span>
                            <Controller
                                control={control}
                                name={`${fullPrefix}placementMode.gridConfig.alignment.y`}
                                defaultValue="here"
                                render={({ field }) => (
                                    <HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
                                        <option value="here">Here</option>
                                        <option value="centre">Centre</option>
                                        <option value="far">Far</option>
                                    </HTMLSelect>
                                )}
                            />
                        </div>
                    </div>
                </FormGroup>

                <div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: "5px" }}>
                    <Controller
                        control={control}
                        name={`${fullPrefix}placementMode.gridConfig.contribution.x`}
                        defaultValue={false}
                        render={({ field }) => (
                            <Switch {...field} checked={field.value} label="Contribute X" onChange={(e) => field.onChange(e.target.checked)} />
                        )}
                    />
                    <Controller
                        control={control}
                        name={`${fullPrefix}placementMode.gridConfig.contribution.y`}
                        defaultValue={false}
                        render={({ field }) => (
                            <Switch {...field} checked={field.value} label="Contribute Y" onChange={(e) => field.onChange(e.target.checked)} />
                        )}
                    />
                </div>
            </>
        );
    } else if (type === "aligner") {
        details = (
            <>
                <div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
                    Index: {placementMode?.alignerConfig?.index ?? "N/A"}
                </div>

                <FormGroup className={styles.simpleGroup} label="Alignment">
                    <Controller
                        control={control}
                        name={`${fullPrefix}placementMode.alignerConfig.alignment`}
                        defaultValue="here"
                        render={({ field }) => (
                            <HTMLSelect {...field} className={fieldStyles.compactHTMLSelect} iconName="caret-down" fill>
                                <option value="here">Here</option>
                                <option value="centre">Centre</option>
                                <option value="far">Far</option>
                            </HTMLSelect>
                        )}
                    />
                </FormGroup>

                <div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: "5px" }}>
                    <Controller
                        control={control}
                        name={`${fullPrefix}placementMode.alignerConfig.contribution.mainAxis`}
                        defaultValue={true}
                        render={({ field }) => (
                            <Switch {...field} checked={field.value} label="Main Axis" onChange={(e) => field.onChange(e.target.checked)} />
                        )}
                    />
                    <Controller
                        control={control}
                        name={`${fullPrefix}placementMode.alignerConfig.contribution.crossAxis`}
                        defaultValue={false}
                        render={({ field }) => (
                            <Switch {...field} checked={field.value} label="Cross Axis" onChange={(e) => field.onChange(e.target.checked)} />
                        )}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <ControlGroup vertical={true} className={styles.formGroupContainer}>
                {coreRow}
                {placementControl === "auto" ? null : details}
            </ControlGroup>
        </>
    );
};
