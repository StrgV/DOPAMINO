import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';
import type { Server as HttpServerNode } from "http"; // Wichtig für Typisierung
import { initCointflipSockets } from "./src/lib/server/coinflipWebSocketHandler"; // Pfad anpassen

const dirname =
	typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const webSocketPlugin: PluginOption = {
  name: "webSocketServer",
  configureServer(server) {
    if (server.httpServer) {
      initCointflipSockets(server.httpServer as HttpServerNode);
    } else {
      // Dieser Fall sollte im normalen SvelteKit Dev-Modus nicht eintreten
      console.error(
        "HTTP-Server nicht im Vite-Serverobjekt gefunden. WebSocket-Server nicht gestartet.",
      );
    }
  },
};
	
// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), webSocketPlugin],
	server: {
		host: '0.0.0.0',
		port: 5173
	},
	test: {
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],
				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
					storybookTest({
						configDir: path.join(dirname, '.storybook')
					})
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: 'playwright',
						instances: [
							{
								browser: 'chromium'
							}
						]
					},
					setupFiles: ['.storybook/vitest.setup.ts']
				}
			}
		]
	}
});
