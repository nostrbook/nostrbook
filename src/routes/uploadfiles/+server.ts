import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import axios  from 'axios';

export const POST: RequestHandler = async ({ request }) => {
    console.log(request)
    
	return json(1+2);
};

// This handler will respond to PUT, PATCH, DELETE, etc.
export const fallback: RequestHandler = async ({ request }) => {
	return text(`I caught your ${request.method} request!`);
};



export const GET: RequestHandler = async ({ request }) => {
    const url = new URL(request.url);
    const imgsrc = url.searchParams.get('imgsrc');

    console.log(imgsrc);

    try {
        const response  = await axios.get(imgsrc, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                 
            },
            responseType: 'arraybuffer'
        });

        const buffer = response.data;
        const contentType = response.headers['content-type'];
        const contentLength = buffer.byteLength.toString();

        // 这里模拟返回一个类似 Response 的对象，实际使用中可能需要根据具体场景调整
        return new Response(buffer,{
            status: 200,
           
        })  
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching image:', error.message);
        } else {
            console.error('An unknown error occurred:', error);
        }
        return new Response('Error fetching image', {
            status: 500,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        });
    }
};    