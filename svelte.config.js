import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import  cors   from 'cors';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      // 在这里配置CORS
      middleware: (app) => {
        app.use(cors({
          origin: '*', // 允许所有来源访问，也可以指定具体的域名，如 'http://example.com'
          methods: ['POST', 'GET', 'PUT', 'DELETE'], // 允许的HTTP方法
          credentials: true // 如果需要支持跨域携带身份凭证（如Cookie），设置为true
        }));
      }
    })
	}
};

export default config;
