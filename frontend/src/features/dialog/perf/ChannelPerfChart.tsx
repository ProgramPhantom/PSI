import React, { useEffect, useRef } from "react";
import { Button, Card, Elevation } from "@blueprintjs/core";
import { Chart } from "chart.js/auto";
import { ChannelAddMetric } from "../../../test/perfTests";

export interface IChannelPerfChartProps {
	metrics: ChannelAddMetric[];
	title?: string;
}

export const ChannelPerfChart: React.FC<IChannelPerfChartProps> = ({
	metrics,
	title = "Channel Addition Execution Time"
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const chartInstanceRef = useRef<Chart | null>(null);

	useEffect(() => {
		if (!canvasRef.current || metrics.length === 0) return;

		// Destroy previous chart instance if it exists
		if (chartInstanceRef.current) {
			chartInstanceRef.current.destroy();
			chartInstanceRef.current = null;
		}

		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const labels = metrics.map((m) => `#${m.index}`);
		const actDurations = metrics.map((m) => Number(m.duration.toFixed(2)));
		const computeDurations = metrics.map((m) => Number(m.computeDuration.toFixed(2)));

		const newChart = new Chart(ctx, {
			type: "line",
			data: {
				labels,
				datasets: [
					{
						label: "Total .act() Time (ms)",
						data: actDurations,
						borderColor: "#2d72d2",
						backgroundColor: "rgba(45, 114, 210, 0.12)",
						borderWidth: 2,
						pointBackgroundColor: "#2d72d2",
						pointBorderColor: "#ffffff",
						pointRadius: 4,
						pointHoverRadius: 6,
						tension: 0.2,
						fill: true
					},
					{
						label: "Layout Compute Time (ms)",
						data: computeDurations,
						borderColor: "#d9822b",
						backgroundColor: "rgba(217, 130, 43, 0.08)",
						borderWidth: 2,
						borderDash: [4, 4],
						pointBackgroundColor: "#d9822b",
						pointBorderColor: "#ffffff",
						pointRadius: 3,
						pointHoverRadius: 5,
						tension: 0.2,
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: {
					duration: 400
				},
				interaction: {
					mode: "index",
					intersect: false
				},
				plugins: {
					title: {
						display: true,
						text: title,
						font: {
							size: 14,
							weight: "bold"
						},
						padding: {
							top: 6,
							bottom: 12
						}
					},
					tooltip: {
						callbacks: {
							title: (tooltipItems) => {
								const idx = tooltipItems[0]?.dataIndex ?? 0;
								const m = metrics[idx];
								return `Addition #${idx + 1} (${m?.templateRef || "Channel"})`;
							},
							label: (tooltipItem) => {
								return ` ${tooltipItem.dataset.label}: ${tooltipItem.formattedValue} ms`;
							},
							afterBody: (tooltipItems) => {
								const idx = tooltipItems[0]?.dataIndex ?? 0;
								const m = metrics[idx];
								return [`Total Channels: ${m?.totalChannelsAfterAdd ?? ""}`];
							}
						}
					},
					legend: {
						position: "top",
						labels: {
							boxWidth: 14,
							padding: 10,
							font: {
								size: 11
							}
						}
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: "Channel Addition Step (#)",
							font: {
								size: 12,
								weight: "bold"
							}
						},
						grid: {
							color: "rgba(128, 128, 128, 0.15)"
						}
					},
					y: {
						title: {
							display: true,
							text: "Execution Time (ms)",
							font: {
								size: 12,
								weight: "bold"
							}
						},
						beginAtZero: true,
						grid: {
							color: "rgba(128, 128, 128, 0.15)"
						}
					}
				}
			}
		});

		chartInstanceRef.current = newChart;

		return () => {
			if (chartInstanceRef.current) {
				chartInstanceRef.current.destroy();
				chartInstanceRef.current = null;
			}
		};
	}, [metrics, title]);

	const handleDownload = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Create a high-quality export canvas with a solid white background
		const exportCanvas = document.createElement("canvas");
		const scale = 2; // 2x resolution for crisp download
		exportCanvas.width = canvas.width * scale;
		exportCanvas.height = canvas.height * scale;
		const ctx = exportCanvas.getContext("2d");

		if (ctx) {
			ctx.scale(scale, scale);
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw header banner with metadata
			ctx.drawImage(canvas, 0, 0);

			const dataUrl = exportCanvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.href = dataUrl;
			link.download = `channel-addition-benchmark-${Date.now()}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	if (metrics.length === 0) {
		return null;
	}

	return (
		<Card elevation={Elevation.ONE} style={{ marginTop: "12px", padding: "12px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
				<div style={{ fontWeight: 600, fontSize: "13px" }}>Benchmark Graph</div>
				<Button
					icon="download"
					small
					intent="primary"
					text="Download Graph (PNG)"
					onClick={handleDownload}
				/>
			</div>

			<div style={{ position: "relative", width: "100%", height: "260px" }}>
				<canvas ref={canvasRef} />
			</div>
		</Card>
	);
};
