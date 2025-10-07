import {Colors} from "@blueprintjs/core";
import ENGINE from "../../logic/engine";
import Spacial, {Dimensions, IBindingPayload, SiteNames} from "../../logic/spacial";
import {PointBind} from "./LineTool";

interface IBindings {
  element: Spacial;
  selectBind: (bindX: IBindingPayload, bindY: IBindingPayload) => void;
}

const AnchorLocations: SiteNames[] = ["here", "centre", "far"];

const BindingsSelector: React.FC<IBindings> = (props) => {
  return (
    <>
      {AnchorLocations.map((xAnchor) => {
        return AnchorLocations.map((yAnchor) => {
          var x = props.element.AnchorFunctions[xAnchor].get("x");
          var y = props.element.AnchorFunctions[yAnchor].get("y");
          var bindingPayloadX: IBindingPayload = {
            bindingRule: {
              anchorSiteName: xAnchor,
              targetSiteName: "here",
              dimension: "x"
            },
            anchorObject: props.element
          };
          var bindingPayloadY: IBindingPayload = {
            bindingRule: {
              anchorSiteName: yAnchor,
              targetSiteName: "here",
              dimension: "y"
            },
            anchorObject: props.element
          };

          return (
            <>
              <style>{`
                .bind-point {
                    position: absolute;
                    width: 2px;    /* bigger hit area */
                    height: 2px;
                    transform: translate(-50%, -50%);
                    cursor: pointer;
                    
                    background-color: #54abe0ff;
                }
                `}</style>
              <div
                className="bind-point"
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  zIndex: 30000,
                  borderRadius: "50%",
                  outlineColor: "transparent"
                }}
                key={`${xAnchor}${yAnchor}`}
                onClick={(e) => {
                  props.selectBind(bindingPayloadX, bindingPayloadY);
                }}
                onMouseOver={(e) => e.stopPropagation()}></div>
            </>
          );
        });
      })}
    </>
  );
};

export default BindingsSelector;
