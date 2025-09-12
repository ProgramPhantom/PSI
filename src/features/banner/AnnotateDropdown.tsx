import { Checkbox } from "@blueprintjs/core";
import { Tool } from "../../app/App";
import { useState } from "react";
import Line, { ILineStyle } from "../../logic/line";



interface IAnnotateDropdownProps {
    selectedTool: Tool
    setTool: (tool: Tool) => void
}


export function AnnotateDropdown(props: IAnnotateDropdownProps) {
    const [lineStyle, setLineStyle] = useState<ILineStyle>(Line.defaults["default"].lineStyle);

    return (
        <div>
            <Checkbox label='Draw Line' onClick={() => props.setTool({type: "arrow", config: lineStyle})} 
            checked={props.selectedTool.type === "arrow" ? true : false}></Checkbox>
        </div>
    )
}