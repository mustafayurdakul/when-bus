import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/when-bus/",
	server: {
		proxy: {
			"/when-bus/proxy": {
				target: "https://www.kocaeli.bel.tr",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/when-bus\/proxy/, ""),
				secure: false
			}
		}
	}
});