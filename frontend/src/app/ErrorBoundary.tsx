import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Card, Elevation, Icon, Collapse } from "@blueprintjs/core";
import localforage from "localforage";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	isDetailsOpen: boolean;
	isResetting: boolean;
	copied: boolean;
}

/**
 * Dispatches a custom critical error event that RootErrorBoundary catches.
 * Can be used by any subsystem (e.g., ENGINE) to trigger the error screen programmatically.
 */
export function triggerCriticalAppError(error: Error | string) {
	window.dispatchEvent(
		new CustomEvent("psi:critical-error", {
			detail: error instanceof Error ? error : new Error(String(error))
		})
	);
}

// Expose to window for easy testing and debugging via DevTools console
if (typeof window !== "undefined") {
	(window as any).triggerCriticalAppError = triggerCriticalAppError;
}

export class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
			isDetailsOpen: false,
			isResetting: false,
			copied: false
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("RootErrorBoundary caught a React render error:", error, errorInfo);
		this.setState({ errorInfo });
	}

	componentDidMount() {
		window.addEventListener("error", this.handleWindowError);
		window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
		window.addEventListener("psi:critical-error", this.handleCustomCriticalError as EventListener);
	}

	componentWillUnmount() {
		window.removeEventListener("error", this.handleWindowError);
		window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
		window.removeEventListener("psi:critical-error", this.handleCustomCriticalError as EventListener);
	}

	private isBenignBrowserError(message: string): boolean {
		if (!message) return false;
		return (
			message.includes("ResizeObserver loop") ||
			message.includes("ResizeObserver loop completed with undelivered notifications") ||
			message.includes("ResizeObserver loop limit exceeded")
		);
	}

	private handleWindowError = (event: ErrorEvent) => {
		const message = event.message || "";
		if (this.isBenignBrowserError(message)) {
			return;
		}

		console.error("RootErrorBoundary intercepted an unhandled window error:", event.error || message);
		const error = event.error instanceof Error ? event.error : new Error(message || "Unhandled runtime error");
		this.setState({ hasError: true, error });
	};

	private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
		console.error("RootErrorBoundary intercepted an unhandled promise rejection:", event.reason);
		const error =
			event.reason instanceof Error
				? event.reason
				: new Error(typeof event.reason === "string" ? event.reason : "Unhandled Promise Rejection");
		this.setState({ hasError: true, error });
	};

	private handleCustomCriticalError = (event: CustomEvent<Error>) => {
		const error = event.detail instanceof Error ? event.detail : new Error(String(event.detail || "Critical Error"));
		console.error("RootErrorBoundary received explicit critical error event:", error);
		this.setState({ hasError: true, error });
	};

	private handleResetApp = async () => {
		this.setState({ isResetting: true });
		try {
			localStorage.clear();
			sessionStorage.clear();
			await localforage.clear();
		} catch (err) {
			console.error("Failed to clear browser storage during application reset:", err);
		} finally {
			window.location.reload();
		}
	};

	private handleReload = () => {
		window.location.reload();
	};

	private handleCopyError = () => {
		const { error, errorInfo } = this.state;
		const details = [
			`Error: ${error?.name || "Error"}: ${error?.message || "Unknown"}`,
			error?.stack ? `\nStack:\n${error.stack}` : "",
			errorInfo?.componentStack ? `\nComponent Stack:\n${errorInfo.componentStack}` : ""
		]
			.filter(Boolean)
			.join("\n");

		navigator.clipboard.writeText(details).then(() => {
			this.setState({ copied: true });
			setTimeout(() => this.setState({ copied: false }), 2500);
		});
	};

	private toggleDetails = () => {
		this.setState((prev) => ({ isDetailsOpen: !prev.isDetailsOpen }));
	};

	render() {
		if (this.state.hasError) {
			const { error, errorInfo, isDetailsOpen, isResetting, copied } = this.state;
			const errorMessage = error?.message || "An unexpected critical error occurred.";
			const errorStack = error?.stack || "";
			const componentStack = errorInfo?.componentStack || "";

			return (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						zIndex: 999999,
						backgroundColor: "#11161b",
						backgroundImage: "radial-gradient(ellipse at center top, #1f2933 0%, #11161b 80%)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "24px",
						boxSizing: "border-box",
						overflowY: "auto",
						color: "#f5f8fa",
						fontFamily: '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
					}}
				>
					<Card
						elevation={Elevation.FOUR}
						style={{
							maxWidth: "640px",
							width: "100%",
							backgroundColor: "#182026",
							border: "1px solid rgba(255, 255, 255, 0.12)",
							borderRadius: "12px",
							padding: "36px",
							boxShadow: "0 20px 50px rgba(0, 0, 0, 0.55)",
							textAlign: "center"
						}}
					>
						{/* Danger Badge Icon */}
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								width: "68px",
								height: "68px",
								borderRadius: "50%",
								backgroundColor: "rgba(219, 55, 55, 0.15)",
								border: "1px solid rgba(219, 55, 55, 0.35)",
								marginBottom: "20px"
							}}
						>
							<Icon icon="error" size={36} color="#f55656" />
						</div>

						<h2
							style={{
								margin: "0 0 10px 0",
								fontSize: "24px",
								fontWeight: 600,
								color: "#ffffff",
								letterSpacing: "-0.3px"
							}}
						>
							Critical Application Error
						</h2>

						<p
							style={{
								margin: "0 0 24px 0",
								fontSize: "14px",
								lineHeight: "1.6",
								color: "#a7b6c2"
							}}
						>
							Pulse Planner ran into an unhandled problem in the layout engine or interface.
							Resetting the application will purge any corrupted diagram state and restore the
							app to working order.
						</p>

						{/* Action Buttons */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "12px",
								marginBottom: "24px"
							}}
						>
							<Button
								intent="danger"
								icon="reset"
								text="Reset Application"
								size="large"
								loading={isResetting}
								onClick={this.handleResetApp}
								style={{
									fontWeight: 600,
									height: "42px",
									boxShadow: "0 4px 12px rgba(219, 55, 55, 0.3)"
								}}
							/>

							<Button
								intent="none"
								icon="refresh"
								text="Try Reloading"
								size="large"
								disabled={isResetting}
								onClick={this.handleReload}
								style={{
									backgroundColor: "rgba(255, 255, 255, 0.06)",
									color: "#c2d1dc",
									height: "38px"
								}}
							/>
						</div>

						{/* Collapsible Technical Details */}
						<div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "16px", textAlign: "left" }}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									cursor: "pointer",
									userSelect: "none"
								}}
								onClick={this.toggleDetails}
							>
								<span style={{ fontSize: "12px", color: "#8a9ba8", fontWeight: 500 }}>
									Technical Details
								</span>
								<Icon
									icon={isDetailsOpen ? "chevron-up" : "chevron-down"}
									size={14}
									color="#8a9ba8"
								/>
							</div>

							<Collapse isOpen={isDetailsOpen}>
								<div style={{ marginTop: "12px" }}>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginBottom: "8px"
										}}
									>
										<span style={{ fontSize: "11px", color: "#f55656", fontWeight: "bold" }}>
											{error?.name || "Error"}: {errorMessage}
										</span>
										<Button
											small={true}
											minimal={true}
											icon={copied ? "tick" : "clipboard"}
											text={copied ? "Copied" : "Copy Details"}
											intent={copied ? "success" : "none"}
											onClick={this.handleCopyError}
											style={{ fontSize: "11px" }}
										/>
									</div>

									<pre
										className="custom-scrollbar"
										style={{
											backgroundColor: "#10161a",
											border: "1px solid rgba(255, 255, 255, 0.08)",
											borderRadius: "6px",
											padding: "12px",
											margin: 0,
											fontSize: "11px",
											fontFamily: "Consolas, Monaco, monospace",
											color: "#ff8f8f",
											maxHeight: "180px",
											overflowX: "auto",
											overflowY: "auto",
											whiteSpace: "pre-wrap",
											wordBreak: "break-all"
										}}
									>
										{errorStack || errorMessage}
										{componentStack ? `\n\nComponent Stack:\n${componentStack}` : ""}
									</pre>
								</div>
							</Collapse>
						</div>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}

export default RootErrorBoundary;
