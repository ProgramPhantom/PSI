import { Button, ButtonGroup, Checkbox, ControlGroup, FormGroup, Menu, MenuItem, NumericInput, Popover, Switch } from "@blueprintjs/core";
import { Tool } from "../../app/App";
import { useEffect, useRef, useState } from "react";
import Line, { HeadStyle, ILineStyle } from "../../logic/line";



interface IAnnotateDropdownProps {
    selectedTool: Tool
    setTool: (tool: Tool) => void
}


export function AnnotateDropdown(props: IAnnotateDropdownProps) {
    const lineStyleRef = useRef<ILineStyle>(Line.defaults["default"].lineStyle);
    const [selectedColour, setSelectedColour] = useState(Line.defaults["default"].lineStyle.stroke);
    const [refresh, setRefresh] = useState(0);

    const applyLineStyleUpdate = (partial: Partial<ILineStyle>) => {
        lineStyleRef.current = { ...lineStyleRef.current, ...partial };
        props.setTool({ type: "arrow", config: lineStyleRef.current });
        setRefresh((v) => v + 1);
    };

    const onSwitch = () => {
        if (props.selectedTool.type === "arrow") {
            props.setTool({type: "select", config: {}})
        } else {
            props.setTool({type: "arrow", config: lineStyleRef.current})
        }
        
    }

    // Sync current ref from selected tool when it changes (e.g., reopening popover)
    // TODO: Fix this garbage
    useEffect(() => {
        if (props.selectedTool.type === "arrow") {
            lineStyleRef.current = props.selectedTool.config;
            setSelectedColour(props.selectedTool.config.stroke)
            setRefresh((v) => v + 1);
        }
    }, [props.selectedTool]);

    return (
        <div>
            <Switch label='Draw Line' onClick={() => onSwitch()} 
            checked={props.selectedTool.type === "arrow" ? true : false}></Switch>

            <ControlGroup fill={true} vertical={true}>
                <FormGroup label="Heads" inline={true}>
                    <ButtonGroup>
                        <Popover minimal={true} hoverOpenDelay={0} hoverCloseDelay={200} interactionKind="click" captureDismiss={true} position="bottom" content={
                            <Menu>
                                <MenuItem text="Default" onClick={() => applyLineStyleUpdate({ headStyle: ["default", lineStyleRef.current.headStyle[1]] })} />
                                <MenuItem text="Thin" onClick={() => applyLineStyleUpdate({ headStyle: ["thin", lineStyleRef.current.headStyle[1]] })} />
                                <MenuItem text="None" onClick={() => applyLineStyleUpdate({ headStyle: ["none", lineStyleRef.current.headStyle[1]] })} />
                            </Menu>
                        }>
                            <Button text={`Start: ${lineStyleRef.current.headStyle[0]}`} endIcon="caret-down" />
                        </Popover>
                        <Popover minimal={true} hoverOpenDelay={0} hoverCloseDelay={200} interactionKind="click" captureDismiss={true} position="bottom" content={
                            <Menu>
                                <MenuItem text="Default" onClick={() => applyLineStyleUpdate({ headStyle: [lineStyleRef.current.headStyle[0], "default"] })} />
                                <MenuItem text="Thin" onClick={() => applyLineStyleUpdate({ headStyle: [lineStyleRef.current.headStyle[0], "thin"] })} />
                                <MenuItem text="None" onClick={() => applyLineStyleUpdate({ headStyle: [lineStyleRef.current.headStyle[0], "none"] })} />
                            </Menu>
                        }>
                            <Button text={`End: ${lineStyleRef.current.headStyle[1]}`} endIcon="caret-down" />
                        </Popover>
                    </ButtonGroup>
                </FormGroup>

                <FormGroup label="Stroke" inline={true}>
                    <input
                        type="color"
                        value={selectedColour}
                        onChange={(e) => {  setSelectedColour(e.target.value) }}
                        onBlur={(e) => {  applyLineStyleUpdate({ stroke: e.target.value }); }}
                        style={{ width: 36, height: 30, padding: 0, border: "none", background: "transparent" }}
                        aria-label="Stroke color"
                    />
                </FormGroup>

                <FormGroup label="Dashing" fill={true} inline={true}>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <NumericInput
                            min={0}
                            placeholder="dash"
                            value={lineStyleRef.current.dashing[0]}
                            onValueChange={(v) => applyLineStyleUpdate({ dashing: [Number.isFinite(v) ? v : 0, lineStyleRef.current.dashing[1]] })}
                            buttonPosition="none"
                            style={{ width: 70 }}
                        />
                        <NumericInput
                            min={0}
                            placeholder="gap"
                            value={lineStyleRef.current.dashing[1]}
                            onValueChange={(v) => applyLineStyleUpdate({ dashing: [lineStyleRef.current.dashing[0], Number.isFinite(v) ? v : 0] })}
                            buttonPosition="none"
                            style={{ width: 70 }}
                        />
                    </div>
                </FormGroup>

                <FormGroup label="Thickness" inline={true}>
                    <NumericInput
                        min={0.5}
                        stepSize={0.5}
                        value={lineStyleRef.current.thickness}
                        onValueChange={(v) => applyLineStyleUpdate({ thickness: Number.isFinite(v) ? v : lineStyleRef.current.thickness })}
                        buttonPosition="none"
                        style={{ width: 80 }}
                    />
                </FormGroup>
            </ControlGroup>


        </div>
    )
}