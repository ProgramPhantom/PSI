import { Checkbox } from "@blueprintjs/core";
import { Tool } from "../../app/App";


interface IAnnotateDropdownProps {
    selectedTool: Tool
    setTool: (tool: Tool) => void
}


export function AnnotateDropdown(props: IAnnotateDropdownProps) {

    return (
        <div>
            <Checkbox label='Draw Line' onClick={() => props.setTool({type: "arrow", config: {style: {headStyle: "none"}}})} 
            checked={props.selectedTool.type === "arrow" ? true : false}></Checkbox>
        </div>
    )
}