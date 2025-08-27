import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import Canvas from './Canvas'
import ElementsDraw from './ElementsDraw'
import { SVG, extend as SVGextend, Element, Svg } from '@svgdotjs/svg.js'
import Form from './Form';
import Banner from './Banner';
import FileSaver, { saveAs } from 'file-saver';
import SVGElementForm from './form/SVGElementForm';
import Mountable from './vanilla/mountable';
import { Visual } from './vanilla/visual';
import { UpdateObj } from './vanilla/util';
import { svgPulses } from './vanilla/default/data/svgPulse';
import SVGElement, { ISVG } from './vanilla/svgElement';
import { defaultMountable } from './vanilla/default/data';
import RectElement, { IRect } from './vanilla/rectElement';
import { simplePulses } from './vanilla/default/data/simplePulse';
import RectForm from './form/RectForm';
import ENGINE from './vanilla/engine';
import Channel from './vanilla/channel';
import Labellable from './vanilla/labellable';
import { OverlayToaster, Toaster, Drawer, Position } from '@blueprintjs/core';
import ComponentResizer from './ComponentResizer';
import Console from './Console';


ENGINE.surface = SVG().attr({"pointer-events": 'bounding-box'});

ENGINE.load()

export const myToaster: Toaster = await OverlayToaster.create({ position: "bottom",  });


export type SelectionMode = "select" | "draw";


function App() {
  console.log("CREATING APP")
  console.info("Application initialized successfully")

  useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
  
  const [form, setForm] = useState<ReactNode | null>(null);
  const [selectedElement, setSelectedElement] = useState<Visual | undefined>(undefined);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("select");

  // Set up automatic saving every 2 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     ENGINE.save();
  //   }, 2000);
// 
  //   // Cleanup interval on component unmount
  //   return () => clearInterval(interval);
  // }, []);

  const canvas: ReactNode = <Canvas select={SelectElement} selectedElement={selectedElement} selectionMode={selectionMode}></Canvas>

  function SaveSVG() {
    try {
      // Get the current SVG surface from the ENGINE
      const surface = ENGINE.surface;
      
      // Create a clone of the surface to avoid modifying the original
      const svgClone = surface.clone(true, false);
      
      // Remove all elements with data-editor="hitbox" attribute
      const hitboxElements = svgClone.find('[data-editor="hitbox"]');
      hitboxElements.forEach(element => {
        element.remove();
      });
      
      // Get the SVG as a string
      const svgString = svgClone.svg();
      
      // Create a blob with the SVG content
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      
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
      console.error('Error saving SVG:', error);
      
      // Show error message
      myToaster.show({
        message: `Failed to save SVG: ${error instanceof Error ? error.message : 'Unknown error'}`,
        intent: "danger",
        icon: "error"
      });
    }
  }

  function SavePNG(width: number, height: number, filename: string) {
    try {
      // Get the current SVG surface from the ENGINE
      const surface = ENGINE.surface;
      
      // Create a clone of the surface to avoid modifying the original
      const svgClone = surface.clone(true, false);
      
      // Remove all elements with data-editor="hitbox" attribute
      const hitboxElements = svgClone.find('[data-editor="hitbox"]');
      hitboxElements.forEach(element => {
        element.remove();
      });
      
      // Get the SVG as a string
      const svgString = svgClone.svg();
      
      // Create a canvas element to convert SVG to PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Create an image from the SVG
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
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
              throw new Error('Failed to create PNG blob');
            }
          }, 'image/png');
          
          // Clean up
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error in PNG conversion:', error);
          URL.revokeObjectURL(url);
          
          myToaster.show({
            message: `Failed to save PNG: ${error instanceof Error ? error.message : 'Unknown error'}`,
            intent: "danger",
            icon: "error"
          });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        throw new Error('Failed to load SVG image');
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('Error saving PNG:', error);
      
      // Show error message
      myToaster.show({
        message: `Failed to save PNG: ${error instanceof Error ? error.message : 'Unknown error'}`,
        intent: "danger",
        icon: "error"
      });
    }
  }

  function SelectElement(element: Visual | undefined) {
    if (element === undefined) {
      setSelectedElement(undefined);
      setForm(null);
      return
    }

    setSelectedElement(element);
  }

  function openConsole() {
    setIsConsoleOpen(true);
  }


  return (
      <>

      <div style={{display: "flex", height: "100%", width: "100%", flexDirection: "column"}}>
        <div style={{width: "100%"}}>
          <Banner saveSVG={SaveSVG} savePNG={SavePNG} openConsole={openConsole} 
          selection={{selectionMode: selectionMode, setSelectionMode: setSelectionMode}}></Banner>
        </div>
        
        <div style={{display: "flex", height: "100%", width: "100%"}}>
          <div style={{flex: "1 1", height: "100%", display: "flex", flexDirection: "column"}}>
            <div style={{height: "100%", position: "relative", cursor: selectionMode === "select" ? "default" : "crosshair"}} >
              {canvas}
            </div>
            
            
              <div style={{position: "relative", bottom: "0px", display: "flex", flexDirection: "column", borderTop: "1px solid #c7c7c7"}}>
                <ComponentResizer resizeDirection="vertical" defaultHeight={250} maxHeight={600} panelName="Elements">
                  <ElementsDraw></ElementsDraw>
                </ComponentResizer>
              </div>
          </div>


          <div style={{gridColumnStart: 2, gridColumnEnd: 3,}}>
            <ComponentResizer resizeDirection='horizontal'
                defaultWidth={400} 
                minWidth={200} 
                maxWidth={800}
              >
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
        icon="console"
        
      >
        <Console isOpen={isConsoleOpen} />
      </Drawer>
      </>
    )
}

export default App
