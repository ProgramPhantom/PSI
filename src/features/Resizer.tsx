import {useRef, useState} from "react";
import {Rnd} from "react-rnd";
import Visual from "../logic/visual";

console.log("Load module resizer")

interface IResizer {
	element: Visual;
}

const Resizer: React.FC<IResizer> = (props) => {
	var copy = props.element.svg?.clone();

	var [x, setX] = useState(0);
	var [y, setY] = useState(0);

	copy?.x(0);
	copy?.y(0);

	const svgRef = useRef<SVGSVGElement | null>();
	svgRef.current.appendChild(copy.node);
	return (
		<>
			<Rnd
				position={{x: props.element.contentX, y: props.element.contentY}}
				default={{
					x: x,
					y: y,
					width: props.element.contentWidth!,
					height: props.element.contentHeight!
				}}
				enableResizing={false}
				onDrag={(e, d) => {
					e.stopPropagation();
					setX(d.x);
					setY(d.y);
				}}>
				<svg className="content" ref={svgRef} style={{height: "100%", width: "100%"}}></svg>
			</Rnd>
		</>
	);
};

export default Resizer;
