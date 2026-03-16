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

import { AppShortcuts } from "./AppShortcuts.tsx";

const CLIENT_ID = "243781410745-6en954mmd4gansujs91gsvq545pdedeg.apps.googleusercontent.com"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<GoogleOAuthProvider clientId={CLIENT_ID}>
		<DndProvider backend={HTML5Backend} debugMode={true}>
			<Provider store={store}>
				<HotkeysProvider>
					<AppShortcuts>
						<MathJaxContext>
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
