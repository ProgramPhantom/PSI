import { UniqueIdentifier } from "@dnd-kit/core";
import { LegacyRef, forwardRef } from "react";

export const Item = forwardRef(
	({id, ...props}: {id: UniqueIdentifier}, ref: LegacyRef<HTMLDivElement>) => {
		return (
			<div
				{...props}
				ref={ref}
				style={{
					width: 100,
					height: 100,
					fill: "red",
					background: "red",
					zIndex: 999
				}}>
				{id}
			</div>
		);
	}
);
