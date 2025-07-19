@@ .. @@
 import { defineConfig } from "vite";
 import react from "@vitejs/plugin-react";
 import path from "path";
 import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

 export default defineConfig({
+  test: {
+    globals: true,
+    environment: 'jsdom',
+    setupFiles: ['./src/tests/setup.ts'],
+  },
   plugins: [
     react(),
     runtimeErrorOverlay(),