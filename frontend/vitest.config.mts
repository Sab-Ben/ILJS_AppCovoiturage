import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import angular from "@analogjs/vite-plugin-angular";

export default defineConfig({
    plugins: [angular(), tsconfigPaths()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
        include: ["src/**/*.{spec,test}.{js,ts}"],
        coverage: {
            reporter: ["lcov", "text"],
            reportsDirectory: "./coverage",
            include: ["app/**/*.ts"],
        },
    },
});