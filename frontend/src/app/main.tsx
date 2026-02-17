import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "../redux/store.ts";

import { HotkeysProvider } from "@blueprintjs/core";
import { MathJaxContext } from "better-react-mathjax";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID = "243781410745-6en954mmd4gansujs91gsvq545pdedeg.apps.googleusercontent.com"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<GoogleOAuthProvider clientId={CLIENT_ID}>
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
	</GoogleOAuthProvider>
);
