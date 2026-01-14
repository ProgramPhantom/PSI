import {
    FormGroup,
    HTMLSelect,
    NumericInput,
    Switch
} from "@blueprintjs/core";
import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

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
            <div style={{ display: "flex", flexDirection: "row", margin: "4px 0px" }}>
                <div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
                    Type: {type}
                </div>
                <div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
                    Control: {placementControl}
                </div>
            </div>
        </>
    );


    if (pulseData) {
        details = (
            <>
                {/* Read-only fields */}
                <div style={{ padding: "4px 8px", fontSize: "0.8em", opacity: 0.7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Index: {pulseData?.index ?? "-"}</span>
                        <span>ChannelID: {pulseData?.channelID ?? "-"}</span>
                        <span>SequenceID: {pulseData?.sequenceID ?? "-"}</span>
                    </div>
                </div>

                <FormGroup style={{ padding: "4px 8px" }} inline label="Orientation">
                    <Controller
                        control={control}
                        name={`${fullPrefix}pulseData.orientation`}
                        defaultValue="top"
                        render={({ field }) => (
                            <HTMLSelect {...field} iconName="caret-down" fill>
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="both">Both</option>
                            </HTMLSelect>
                        )}
                    />
                </FormGroup>

                <FormGroup style={{ padding: "4px 8px" }} inline label="Align X">
                    <Controller
                        control={control}
                        name={`${fullPrefix}pulseData.alignment.x`}
                        defaultValue="here"
                        render={({ field }) => (
                            <HTMLSelect {...field} iconName="caret-down" fill>
                                <option value="here">Left</option>
                                <option value="centre">Centre</option>
                                <option value="far">Right</option>
                            </HTMLSelect>
                        )}
                    />
                </FormGroup>
                <FormGroup style={{ padding: "4px 8px" }} inline label="Align Y">
                    <Controller
                        control={control}
                        name={`${fullPrefix}pulseData.alignment.y`}
                        defaultValue="here"
                        render={({ field }) => (
                            <HTMLSelect {...field} iconName="caret-down" fill>
                                <option value="here">Top</option>
                                <option value="centre">Centre</option>
                                <option value="far">Bottom</option>
                            </HTMLSelect>
                        )}
                    />
                </FormGroup>

                <FormGroup style={{ padding: "4px 8px" }} inline label="No. Sections">
                    <Controller
                        control={control}
                        name={`${fullPrefix}pulseData.noSections`}
                        defaultValue={1}
                        render={({ field }) => (
                            <NumericInput {...field} onValueChange={field.onChange} min={1} max={10} size="small" fill />
                        )}
                    />
                </FormGroup>

                <FormGroup style={{ padding: "4px 8px" }} inline label="Clip Channel Bar">
                    <Controller
                        control={control}
                        name={`${fullPrefix}pulseData.clipBar`}
                        render={({ field }) => (
                            <Switch {...field} onChange={field.onChange} checked={field.value} />
                        )}
                    />
                </FormGroup>
            </>
        );
    } else if (type === "grid") {
        details = (
            <>
                <div style={{ display: "flex", gap: "10px", padding: "0 8px" }}>
                    <FormGroup style={{ flex: 1 }} label="Row">
                        <Controller
                            control={control}
                            name={`${fullPrefix}placementMode.gridConfig.coords.row`}
                            defaultValue={0}
                            render={({ field }) => (
                                <NumericInput {...field} onValueChange={field.onChange} min={0} size="small" fill />
                            )}
                        />
                    </FormGroup>
                    <FormGroup style={{ flex: 1 }} label="Col">
                        <Controller
                            control={control}
                            name={`${fullPrefix}placementMode.gridConfig.coords.col`}
                            defaultValue={0}
                            render={({ field }) => (
                                <NumericInput {...field} onValueChange={field.onChange} min={0} size="small" fill />
                            )}
                        />
                    </FormGroup>
                </div>

                <div style={{ display: "flex", gap: "10px", padding: "0 8px" }}>
                    <FormGroup style={{ flex: 1 }} label="Row Span">
                        <Controller
                            control={control}
                            name={`${fullPrefix}placementMode.gridConfig.gridSize.noRows`}
                            defaultValue={1}
                            render={({ field }) => (
                                <NumericInput {...field} onValueChange={field.onChange} min={1} size="small" fill />
                            )}
                        />
                    </FormGroup>
                    <FormGroup style={{ flex: 1 }} label="Col Span">
                        <Controller
                            control={control}
                            name={`${fullPrefix}placementMode.gridConfig.gridSize.noCols`}
                            defaultValue={1}
                            render={({ field }) => (
                                <NumericInput {...field} onValueChange={field.onChange} min={1} size="small" fill />
                            )}
                        />
                    </FormGroup>
                </div>

                <FormGroup style={{ padding: "4px 8px" }} inline label="Align X">
                    <Controller
                        control={control}
                        name={`${fullPrefix}placementMode.gridConfig.alignment.x`}
                        defaultValue="here"
                        render={({ field }) => (
                            <HTMLSelect {...field} iconName="caret-down" fill>
                                <option value="here">Here</option>
                                <option value="centre">Centre</option>
                                <option value="far">Far</option>
                            </HTMLSelect>
                        )}
                    />
                </FormGroup>
                <FormGroup style={{ padding: "4px 8px" }} inline label="Align Y">
                    <Controller
                        control={control}
                        name={`${fullPrefix}placementMode.gridConfig.alignment.y`}
                        defaultValue="here"
                        render={({ field }) => (
                            <HTMLSelect {...field} iconName="caret-down" fill>
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

                <FormGroup style={{ padding: "4px 8px" }} inline label="Alignment">
                    <Controller
                        control={control}
                        name={`${fullPrefix}placementMode.alignerConfig.alignment`}
                        defaultValue="here"
                        render={({ field }) => (
                            <HTMLSelect {...field} iconName="caret-down" fill>
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
            {coreRow}
            {placementControl === "auto" ? null : details}
        </>
    );
};
