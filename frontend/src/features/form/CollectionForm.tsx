import React from "react";
import Collection from "../../logic/collection";
import { CollectionChildrenList } from "./CollectionChildrenList";
import { FormRequirements } from "./FormBase";

export interface CollectionFormProps extends FormRequirements { }

export const CollectionForm: React.FC<CollectionFormProps> = (props) => {
	const target = props.target;

	if (!target || !Collection.isCollection(target)) {
		return null;
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>

			<CollectionChildrenList target={target} />
		</div>
	);
};

export default CollectionForm;
