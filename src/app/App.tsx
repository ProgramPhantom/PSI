import {Drawer, OverlayToaster, Position, Toaster} from "@blueprintjs/core";
import {SVG} from "@svgdotjs/svg.js";
import {saveAs} from "file-saver";
import {ReactNode, useState, useSyncExternalStore} from "react";
import {createRoot} from "react-dom/client";
import Banner from "../features/banner/Banner";
import Console from "../features/banner/Console";
import Canvas from "../features/canvas/Canvas";
import ComponentResizer from "../features/canvas/ComponentResizer";
import {IDrawArrowConfig} from "../features/canvas/LineTool";
import ElementsDraw from "../features/elementDraw/ElementsDraw";
import Form from "../features/Form";
import ENGINE from "../logic/engine";
import {Visual} from "../logic/visual";
import {WelcomeSplash} from "./WelcomeSplash";

export const myToaster: Toaster = await OverlayToaster.createAsync(
  {position: "bottom"},
  {
    domRenderer: (toaster, containerElement) => createRoot(containerElement).render(toaster)
  }
);

ENGINE.initialiseSchemeManager();
await ENGINE.loadSVGData();
ENGINE.surface = SVG().attr({"pointer-events": "bounding-box"});

ENGINE.loadDiagramState();
ENGINE.createSingletons();

export interface IToolConfig {}

export type Tool = {type: "select"; config: {}} | {type: "arrow"; config: IDrawArrowConfig};

function App() {
  console.log("CREATING APP");
  console.info("Application initialized successfully");

  useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

  const [form, setForm] = useState<ReactNode | null>(null);
  const [selectedElement, setSelectedElement] = useState<Visual | undefined>(undefined);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const [selectedTool, setSelectedTool] = useState<Tool>({
    type: "select",
    config: {}
  });

  // Set up automatic saving every 2 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     ENGINE.save();
  //   }, 2000);
  //
  //   // Cleanup interval on component unmount
  //   return () => clearInterval(interval);
  // }, []);

  const setTool = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const SaveSVG = () => {
    try {
      // Get the current SVG surface from the ENGINE
      const surface = ENGINE.surface;

      // Create a clone of the surface to avoid modifying the original
      const svgClone = surface.clone(true, false);

      // Remove all elements with data-editor="hitbox" attribute
      const hitboxElements = svgClone.find('[data-editor="hitbox"]');
      hitboxElements.forEach((element) => {
        element.remove();
      });

      // Get the SVG as a string
      const svgString = svgClone.svg();

      // Create a blob with the SVG content
      const blob = new Blob([svgString], {type: "image/svg+xml"});

      // Use the current image name from ENGINE or default to a timestamp
      const fileName = ENGINE.currentImageName || `pulse-diagram-${Date.now()}.svg`;

      // Save the file using file-saver
      saveAs(blob, fileName);

      // Show success message
      myToaster.show({
        message: `SVG saved successfully as ${fileName}`,
        intent: "success",
        icon: "tick-circle"
      });
    } catch (error) {
      console.error("Error saving SVG:", error);

      // Show error message
      myToaster.show({
        message: `Failed to save SVG: ${error instanceof Error ? error.message : "Unknown error"}`,
        intent: "danger",
        icon: "error"
      });
    }
  };

  const SavePNG = (width: number, height: number, filename: string) => {
    try {
      // Get the current SVG surface from the ENGINE
      const surface = ENGINE.surface;

      // Create a clone of the surface to avoid modifying the original
      const svgClone = surface.clone(true, false);

      // Remove all elements with data-editor="hitbox" attribute
      const hitboxElements = svgClone.find('[data-editor="hitbox"]');
      hitboxElements.forEach((element) => {
        element.remove();
      });

      // Get the SVG as a string
      const svgString = svgClone.svg();

      // Create a canvas element to convert SVG to PNG
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Create an image from the SVG
      const img = new Image();
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8"
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          // Clear canvas and draw the image
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to blob and save
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, filename);

              // Show success message
              myToaster.show({
                message: `PNG saved successfully as ${filename}`,
                intent: "success",
                icon: "tick-circle"
              });
            } else {
              throw new Error("Failed to create PNG blob");
            }
          }, "image/png");

          // Clean up
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error in PNG conversion:", error);
          URL.revokeObjectURL(url);

          myToaster.show({
            message: `Failed to save PNG: ${error instanceof Error ? error.message : "Unknown error"}`,
            intent: "danger",
            icon: "error"
          });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        throw new Error("Failed to load SVG image");
      };

      img.src = url;
    } catch (error) {
      console.error("Error saving PNG:", error);

      // Show error message
      myToaster.show({
        message: `Failed to save PNG: ${error instanceof Error ? error.message : "Unknown error"}`,
        intent: "danger",
        icon: "error"
      });
    }
  };

  const SelectElement = (element: Visual | undefined) => {
    if (element === undefined) {
      setSelectedElement(undefined);
      setForm(null);
      return;
    }

    setSelectedElement(element);
  };

  const openConsole = () => {
    setIsConsoleOpen(true);
  };

  const canvas: ReactNode = (
    <Canvas
      select={SelectElement}
      selectedElement={selectedElement}
      selectedTool={selectedTool}
      setTool={setSelectedTool}></Canvas>
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column"
        }}>
        <div style={{width: "100%"}}>
          <Banner
            saveSVG={SaveSVG}
            savePNG={SavePNG}
            openConsole={openConsole}
            selectedTool={selectedTool}
            setTool={setTool}></Banner>
        </div>

        <div style={{display: "flex", height: "100%", width: "100%"}}>
          <div
            style={{
              flex: "1 1",
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}>
            <div
              style={{
                height: "100%",
                position: "relative",
                cursor: selectedTool.type === "select" ? "default" : "crosshair"
              }}>
              {canvas}
            </div>

            <div
              style={{
                position: "relative",
                bottom: "0px",
                display: "flex",
                flexDirection: "column",
                borderTop: "1px solid #c7c7c7"
              }}>
              <ComponentResizer
                resizeDirection="vertical"
                defaultHeight={330}
                maxHeight={600}
                panelName="Elements">
                <ElementsDraw></ElementsDraw>
              </ComponentResizer>
            </div>
          </div>

          <div style={{gridColumnStart: 2, gridColumnEnd: 3}}>
            <ComponentResizer
              resizeDirection="horizontal"
              defaultWidth={400}
              minWidth={200}
              maxWidth={800}>
              <Form target={selectedElement} changeTarget={setSelectedElement}></Form>
            </ComponentResizer>
          </div>
        </div>
      </div>

      {/* Console Drawer */}
      <Drawer
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        position={Position.BOTTOM}
        size="50%"
        title="Console Output"
        icon="console">
        <Console isOpen={isConsoleOpen} />
      </Drawer>

      <WelcomeSplash></WelcomeSplash>
    </>
  );
}

export default App;
