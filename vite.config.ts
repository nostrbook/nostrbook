import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
	plugins: [
    tailwindcss(),
    sveltekit(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/docsify/lib/themes/vue.css',
          dest: 'static/css',  // 复制到 dist/static/css/vue.css
        },
        {
          src: 'node_modules/docsify/lib/docsify.min.js',
          dest: 'static/js',   // 复制到 dist/static/js/docsify.min.js
        }]
     })
   ], //plugins

});
