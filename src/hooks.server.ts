 
import type { Handle } from '@sveltejs/kit';
import { defaultRelays } from '$lib/config';
import { booklist } from '$lib/bookevent';

// 全局缓存数据（启动时加载）
let cachedBooks: any[] = [];

// 初始化函数：启动时加载数据
function initializeBooks() {
    return new Promise<void>((resolve) => {
        booklist(defaultRelays, (e) => {
            if (e.created_at >= 1742537924) {
                cachedBooks.push({
                    id: e.id,
                    content: JSON.parse(e.content),
                    tags: e.tags,
                    created_at: e.created_at,
                    pubkey: e.pubkey
                });
            }
        });

        // 设置超时（避免无限等待）
        setTimeout(() => {
            console.log('Initialized books:', cachedBooks.length);
            resolve();
        }, 3000); // 最长等待 3 秒
    });
}

// 启动时初始化（仅运行一次）
initializeBooks();

// 注入数据到每个请求
export const handle: Handle = async ({ event, resolve }) => {
    event.locals.books = cachedBooks; // 共享数据
    const response = await resolve(event);
    const {url,method} = event.request;
    console.log(url,response.status)
    return response
};
