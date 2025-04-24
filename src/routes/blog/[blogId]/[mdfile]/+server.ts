import type { RequestHandler } from './$types';
import { defaultRelays } from '$lib/config';
import { readblog} from '$lib/bookevent';
import {marked} from 'marked';

export const GET: RequestHandler = async ({ params, url }) => {
    console.log(params);
    let blogId = params.blogId;
    let mdfile = params.mdfile;
    const format = url.searchParams.get('format');
    

    if (mdfile == "_404.md") {
       return new Response('Not Found', {
            status: 404,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        });
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
          reject(new Error('404'));
      }, 10000); // 10 秒超时
  });
  
  const contentPromise = new Promise<string>((resolve) => {
      readblog(defaultRelays, blogId, (e) => resolve(e.content));
  });
  
  try {
      const content = await Promise.race([contentPromise, timeoutPromise]);

      if (format === 'html') {
        const processedContent = content.replace(/\]\(\//g, '](./');
        const htmlContent = marked(processedContent);
         
        return new Response(htmlContent, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        });
      } else {
        return new Response(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        });
      }

  } catch (error) {
      if (error.message === '404') {
          return new Response('Not Found', {
              status: 404,
              headers: {
                  'Content-Type': 'text/plain; charset=utf-8'
              }
          });
      }
    }
  };