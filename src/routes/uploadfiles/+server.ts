import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fetch from 'node-fetch'; 

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
        // 发起请求下载图片
        const response = await fetch(imgsrc);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // 获取图片的二进制数据
        const buffer = await response.buffer();

        // 返回图片内容
        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Type': response.headers.get('Content-Type'),
                'Content-Length': buffer.length.toString()
            }
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        return new Response('Error fetching image', {
            status: 500,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        });
    }
};    