// vite.config.ts
import { defineConfig } from "file:///C:/Users/henry/OneDrive/Documents/PSI/PSIPull2/PSI/node_modules/vite/dist/node/index.js";
import { nodePolyfills } from "file:///C:/Users/henry/OneDrive/Documents/PSI/PSIPull2/PSI/node_modules/vite-plugin-node-polyfills/dist/index.js";
import react from "file:///C:/Users/henry/OneDrive/Documents/PSI/PSIPull2/PSI/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  appType: "mpa",
  esbuild: {
    supported: {
      "top-level-await": true
      //browsers can handle top-level-await features
    }
  },
  base: "/PSI/",
  plugins: [
    react(),
    nodePolyfills({
      // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
      include: ["path"],
      // To exclude specific polyfills, add them to this list. Note: if include is provided, this has no effect
      exclude: [
        "http"
        // Excludes the polyfill for `http` and `node:http`.
      ],
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        // can also be 'build', 'dev', or false
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
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxoZW5yeVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcUFNJXFxcXFBTSVB1bGwyXFxcXFBTSVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcaGVucnlcXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXFBTSVxcXFxQU0lQdWxsMlxcXFxQU0lcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2hlbnJ5L09uZURyaXZlL0RvY3VtZW50cy9QU0kvUFNJUHVsbDIvUFNJL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHtkZWZpbmVDb25maWd9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQge25vZGVQb2x5ZmlsbHN9IGZyb20gXCJ2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxsc1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcblx0YXBwVHlwZTogXCJtcGFcIixcblx0ZXNidWlsZDoge1xuXHRcdHN1cHBvcnRlZDoge1xuXHRcdFx0XCJ0b3AtbGV2ZWwtYXdhaXRcIjogdHJ1ZSAvL2Jyb3dzZXJzIGNhbiBoYW5kbGUgdG9wLWxldmVsLWF3YWl0IGZlYXR1cmVzXG5cdFx0fVxuXHR9LFxuXHRiYXNlOiBcIi9QU0kvXCIsXG5cdHBsdWdpbnM6IFtcblx0XHRyZWFjdCgpLFxuXHRcdG5vZGVQb2x5ZmlsbHMoe1xuXHRcdFx0Ly8gVG8gYWRkIG9ubHkgc3BlY2lmaWMgcG9seWZpbGxzLCBhZGQgdGhlbSBoZXJlLiBJZiBubyBvcHRpb24gaXMgcGFzc2VkLCBhZGRzIGFsbCBwb2x5ZmlsbHNcblx0XHRcdGluY2x1ZGU6IFtcInBhdGhcIl0sXG5cdFx0XHQvLyBUbyBleGNsdWRlIHNwZWNpZmljIHBvbHlmaWxscywgYWRkIHRoZW0gdG8gdGhpcyBsaXN0LiBOb3RlOiBpZiBpbmNsdWRlIGlzIHByb3ZpZGVkLCB0aGlzIGhhcyBubyBlZmZlY3Rcblx0XHRcdGV4Y2x1ZGU6IFtcblx0XHRcdFx0XCJodHRwXCIgLy8gRXhjbHVkZXMgdGhlIHBvbHlmaWxsIGZvciBgaHR0cGAgYW5kIGBub2RlOmh0dHBgLlxuXHRcdFx0XSxcblx0XHRcdC8vIFdoZXRoZXIgdG8gcG9seWZpbGwgc3BlY2lmaWMgZ2xvYmFscy5cblx0XHRcdGdsb2JhbHM6IHtcblx0XHRcdFx0QnVmZmVyOiB0cnVlLCAvLyBjYW4gYWxzbyBiZSAnYnVpbGQnLCAnZGV2Jywgb3IgZmFsc2Vcblx0XHRcdFx0Z2xvYmFsOiB0cnVlLFxuXHRcdFx0XHRwcm9jZXNzOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Ly8gT3ZlcnJpZGUgdGhlIGRlZmF1bHQgcG9seWZpbGxzIGZvciBzcGVjaWZpYyBtb2R1bGVzLlxuXHRcdFx0b3ZlcnJpZGVzOiB7XG5cdFx0XHRcdC8vIFNpbmNlIGBmc2AgaXMgbm90IHN1cHBvcnRlZCBpbiBicm93c2Vycywgd2UgY2FuIHVzZSB0aGUgYG1lbWZzYCBwYWNrYWdlIHRvIHBvbHlmaWxsIGl0LlxuXHRcdFx0XHRmczogXCJtZW1mc1wiXG5cdFx0XHR9LFxuXHRcdFx0Ly8gV2hldGhlciB0byBwb2x5ZmlsbCBgbm9kZTpgIHByb3RvY29sIGltcG9ydHMuXG5cdFx0XHRwcm90b2NvbEltcG9ydHM6IHRydWVcblx0XHR9KVxuXHRdXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1YsU0FBUSxvQkFBbUI7QUFDblgsU0FBUSxxQkFBb0I7QUFDNUIsT0FBTyxXQUFXO0FBR2xCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxJQUNSLFdBQVc7QUFBQSxNQUNWLG1CQUFtQjtBQUFBO0FBQUEsSUFDcEI7QUFBQSxFQUNEO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixjQUFjO0FBQUE7QUFBQSxNQUViLFNBQVMsQ0FBQyxNQUFNO0FBQUE7QUFBQSxNQUVoQixTQUFTO0FBQUEsUUFDUjtBQUFBO0FBQUEsTUFDRDtBQUFBO0FBQUEsTUFFQSxTQUFTO0FBQUEsUUFDUixRQUFRO0FBQUE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxNQUNWO0FBQUE7QUFBQSxNQUVBLFdBQVc7QUFBQTtBQUFBLFFBRVYsSUFBSTtBQUFBLE1BQ0w7QUFBQTtBQUFBLE1BRUEsaUJBQWlCO0FBQUEsSUFDbEIsQ0FBQztBQUFBLEVBQ0Y7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
