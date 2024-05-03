import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), SvelteKitPWA({
		strategies: 'generateSW',
		manifest: {
			short_name: 'Studier',
			name: 'Studier',
			start_url: '/',
			scope: '/',
			display: 'standalone',
			theme_color: "#212529",
			background_color: "#212529",
			icons: [
				{
					src: '/pwa-512x512.png',
					sizes: '512x512',
					type: 'image/png',
				},
			],
		},
		injectManifest: {
			globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2,mp3}']
		},
	})]
});
