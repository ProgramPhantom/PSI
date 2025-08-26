import { Control } from "react-hook-form";
import DiagramHandler from "../vanilla/diagramHandler";
import Point from "../vanilla/point";
import { IVisual, Visual } from "../vanilla/visual";


interface IForm<T extends IVisual = IVisual> {
    // reselect: (element: Visual | undefined) => void

    control: Control<Partial<T>>
}

export interface FormDescriptor<T extends IVisual = IVisual> {
    formComponent: React.FC<IForm<T>>,
    drawClass:  typeof Visual,
    defaultValues: T,
}

export default IForm;