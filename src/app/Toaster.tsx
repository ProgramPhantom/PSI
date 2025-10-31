import { OverlayToaster, Toaster } from "@blueprintjs/core";
import { createRoot } from "react-dom/client";


export const appToaster: Toaster = await OverlayToaster.createAsync(
	{position: "bottom"},
	{
		domRenderer: (toaster, containerElement) => createRoot(containerElement).render(toaster)
	}
);