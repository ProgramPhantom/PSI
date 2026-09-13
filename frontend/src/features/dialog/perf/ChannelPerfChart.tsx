import React, { useEffect, useRef } from "react";
import { Button, Card, Elevation } from "@blueprintjs/core";
import { Chart } from "chart.js/auto";
import { PerfMetricItem } from "../../../test/perfTests";

export interface IChannelPerfChartProps {
	metrics: PerfMetricItem[];
	title?: string;
	xAxisLabel?: string;
	lineColor?: string;
	fillColor?: string;
	computeLineColor?: string;
	downloadFilenamePrefix?: string;
	labelFormatter?: (m: PerfMetricItem) => string;
}

export const ChannelPerfChart: React.FC<IChannelPerfChartProps> = ({
	metrics,
	title = "Execution Time",
	xAxisLabel = "Step (#)",
	lineColor = "#2d72d2",
	fillColor = "rgba(45, 114, 210, 0.12)",
	computeLineColor = "#d9822b",
	downloadFilenamePrefix = "benchmark",
	labelFormatter
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

		const labels = metrics.map(labelFormatter || ((m) => `#${m.index}`));
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
						borderColor: lineColor,
						backgroundColor: fillColor,
						borderWidth: 2,
						pointBackgroundColor: lineColor,
						pointBorderColor: "#ffffff",
						pointRadius: 4,
						pointHoverRadius: 6,
						tension: 0.2,
						fill: true
					},
					{
						label: "Layout Compute Time (ms)",
						data: computeDurations,
						borderColor: computeLineColor,
						backgroundColor: "rgba(217, 130, 43, 0.08)",
						borderWidth: 2,
						borderDash: [4, 4],
						pointBackgroundColor: computeLineColor,
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
							size: 13,
							weight: "bold"
						},
						padding: {
							top: 6,
							bottom: 10
						}
					},
					tooltip: {
						callbacks: {
							title: (tooltipItems) => {
								const idx = tooltipItems[0]?.dataIndex ?? 0;
								const m = metrics[idx];
								return `Step #${idx + 1} (${m?.templateRef || "Item"})`;
							},
							label: (tooltipItem) => {
								return ` ${tooltipItem.dataset.label}: ${tooltipItem.formattedValue} ms`;
							},
							afterBody: (tooltipItems) => {
								const idx = tooltipItems[0]?.dataIndex ?? 0;
								const m = metrics[idx];
								const count = m?.totalElementsAfterAdd;
								return count !== undefined ? [`Total Elements: ${count}`] : [];
							}
						}
					},
					legend: {
						position: "top",
						labels: {
							boxWidth: 12,
							padding: 8,
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
							text: xAxisLabel,
							font: {
								size: 11,
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
							text: "Time (ms)",
							font: {
								size: 11,
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
	}, [metrics, title, xAxisLabel, lineColor, fillColor, computeLineColor, labelFormatter]);

	const handleDownload = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const exportCanvas = document.createElement("canvas");
		const scale = 2; // 2x resolution
		exportCanvas.width = canvas.width * scale;
		exportCanvas.height = canvas.height * scale;
		const ctx = exportCanvas.getContext("2d");

		if (ctx) {
			ctx.scale(scale, scale);
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(canvas, 0, 0);

			const dataUrl = exportCanvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.href = dataUrl;
			link.download = `${downloadFilenamePrefix}-${Date.now()}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	if (metrics.length === 0) {
		return null;
	}

	return (
		<Card elevation={Elevation.ONE} style={{ padding: "10px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
				<div style={{ fontWeight: 600, fontSize: "12px" }}>{title}</div>
				<Button
					icon="download"
					small
					minimal
					intent="primary"
					text="Download (PNG)"
					onClick={handleDownload}
				/>
			</div>

			<div style={{ position: "relative", width: "100%", height: "230px" }}>
				<canvas ref={canvasRef} />
			</div>
		</Card>
	);
};
