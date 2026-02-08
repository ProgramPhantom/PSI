import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "../redux/store";

import { HotkeysProvider } from "@blueprintjs/core";
import { MathJaxContext } from "better-react-mathjax";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";



ReactDOM.createRoot(document.getElementById("root")!).render(
	<DndProvider backend={HTML5Backend} debugMode={true}>
		<Provider store={store}>
			<HotkeysProvider>
				<MathJaxContext>
					<StrictMode>
						<App />
					</StrictMode>
				</MathJaxContext>
			</HotkeysProvider>
		</Provider>
	</DndProvider>
);
