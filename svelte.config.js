import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	compilerOptions:{
		runes: true
	},

	kit: {
		adapter: adapter(),
		csp:{
			directives: {
				'script-src': [
					'self', 
					"https://maps.googleapis.com",
				],
				'img-src': [
					'self', 
				'https://maps.googleapis.com',
				'https://maps.gstatic.com/']
            },
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;
