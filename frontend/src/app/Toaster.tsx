import { OverlayToaster, Toaster } from "@blueprintjs/core";
import { createRoot } from "react-dom/client";


export const appToaster: Toaster = await OverlayToaster.createAsync(
	{ position: "bottom", maxToasts: 3 },
	{
		domRenderer: (toaster, containerElement) => createRoot(containerElement).render(toaster)
	}
);