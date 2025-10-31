import { Control } from "react-hook-form";
import Visual, { IVisual  } from "../../logic/visual";
import { AllComponentTypes } from "../../logic/point";

interface IForm<T extends IVisual = IVisual> {
	// reselect: (element: Visual | undefined) => void

	control: Control<Partial<T>>;
}

export interface FormDescriptor<T extends IVisual = IVisual> {
	formComponent: React.FC<IForm<T>>;
	drawClass: typeof Visual;
	defaultValues: T;
}

export interface FormHolderProps {
	target?: Visual;
	changeTarget: (val: Visual | undefined) => void;
}

export interface FormHolderProps {
	target?: Visual;
	targetType: AllComponentTypes;
	changeTarget: (val: Visual | undefined) => void;
}

export interface FormRequirements {
	target?: Visual;
	prefix?: string;
}



export default IForm;
