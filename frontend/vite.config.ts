import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";
import CircularDependencyPlugin from "vite-plugin-circular-dependency";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// A simple plugin to serve static files from docs/build at /PSI/wiki/ during local development
function serveStaticWikiPlugin() {
	return {
		name: "serve-static-wiki",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const url = req.url ? req.url.split('?')[0].split('#')[0] : '';
				
				if (url.startsWith('/PSI/wiki') || url === '/PSI/wiki') {
					let relativePath = url.slice('/PSI/wiki'.length);
					
					if (relativePath === '' || relativePath === '/') {
						relativePath = '/index.html';
					}
					
					const filePath = path.resolve(__dirname, '../docs/build', relativePath.startsWith('/') ? relativePath.slice(1) : relativePath);
					
					if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
						const ext = path.extname(filePath).toLowerCase();
						const contentTypes: Record<string, string> = {
							'.html': 'text/html; charset=utf-8',
							'.js': 'application/javascript; charset=utf-8',
							'.css': 'text/css; charset=utf-8',
							'.png': 'image/png',
							'.jpg': 'image/jpeg',
							'.jpeg': 'image/jpeg',
							'.gif': 'image/gif',
							'.svg': 'image/svg+xml',
							'.json': 'application/json; charset=utf-8',
							'.ico': 'image/x-icon',
							'.woff': 'font/woff',
							'.woff2': 'font/woff2',
							'.ttf': 'font/ttf',
						};
						
						res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
						res.end(fs.readFileSync(filePath));
						return;
					}
				}
				next();
			});
		}
	};
}

// https://vitejs.dev/config/
export default defineConfig({
	appType: "mpa",
	esbuild: {
		sourcemap: true,
		supported: {
			"top-level-await": true //browsers can handle top-level-await features
		}
	},
	server: {
		proxy: {
			// If the request starts with /api, forward it to the backend
			"/api": {
				// target: "http://90.251.68.254:8901",
				target: "http://localhost:3000",
				changeOrigin: true
			}
		}
	},
	base: "/PSI/",
	plugins: [
		serveStaticWikiPlugin(),
		react(),
		nodePolyfills({
			// To add only specific polyfills, add them here. If no option is passed, adds all polyfills
			include: ["path"],
			// To exclude specific polyfills, add them to this list. Note: if include is provided, this has no effect
			exclude: [
				"http" // Excludes the polyfill for `http` and `node:http`.
			],
			// Whether to polyfill specific globals.
			globals: {
				Buffer: true, // can also be 'build', 'dev', or false
				global: true,
				process: true
			},
			// Override the default polyfills for specific modules.
			overrides: {
				// Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
				fs: "memfs"
			},
			// Whether to polyfill `node:` protocol imports.
			protocolImports: true
		}),
		CircularDependencyPlugin({
			outputFilePath: "./circleDep",
			include: ["/\.ts$/"],
			exclude: ["/node_modules/"]
		})
	],
	build: {
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						if (id.includes("@blueprintjs")) {
							return "blueprintjs";
						}
						return "vendor";
					}
				}
			}
		}
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler' // or "modern"
			}
		}
	}
});
