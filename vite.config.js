import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default {
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: resolve(process.cwd(), "popup.html"),
      },
    },
  },
}; 