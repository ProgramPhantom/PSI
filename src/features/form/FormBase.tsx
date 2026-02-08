import { Control } from "react-hook-form";
import Visual, { IVisual } from "../../logic/visual";

interface IForm<T extends IVisual = IVisual> {
	// reselect: (element: Visual | undefined) => void

	control: Control<Partial<T>>;
}

export interface FormDescriptor<T extends IVisual = IVisual> {
	formComponent: React.FC<IForm<T>>;
	drawClass: typeof Visual;
	defaultValues: T;
}


export interface FormRequirements {
	target?: Visual;
	prefix?: string;
}



export default IForm;
