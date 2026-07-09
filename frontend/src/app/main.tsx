import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../redux/store.ts";
import App from "./App.tsx";

import { HotkeysProvider } from "@blueprintjs/core";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MathJaxContext } from "better-react-mathjax";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "../styles/scrollbar.scss";
import "../styles/blueprint-overrides.scss";

import { AppShortcuts } from "./AppShortcuts.tsx";
import ENGINE from "../logic/engine.ts";

const CLIENT_ID = "243781410745-6en954mmd4gansujs91gsvq545pdedeg.apps.googleusercontent.com"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<GoogleOAuthProvider clientId={CLIENT_ID}>
		<DndProvider backend={HTML5Backend} debugMode={true}>
			<Provider store={store}>
				<HotkeysProvider>
					<AppShortcuts>
						<MathJaxContext
							src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"
							config={{ svg: { fontCache: "global" } }}
						>
							<StrictMode>
								<PersistGate loading={null} persistor={persistor}>
									<App />
								</PersistGate>
							</StrictMode>
						</MathJaxContext>
					</AppShortcuts>
				</HotkeysProvider>
			</Provider>
		</DndProvider>
	</GoogleOAuthProvider>
);
