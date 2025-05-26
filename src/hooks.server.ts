 
import type { Handle } from '@sveltejs/kit';
import { defaultRelays } from '$lib/config';
import { booklist,bloglist } from '$lib/bookevent';
import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from 'xmldom';

// 全局缓存数据（启动时加载）
let cachedBooks: any[] = [];
let cachedBlogs: any[] = [];

// 初始化函数：启动时加载数据
function initializeDatas() {
    return new Promise<void>((resolve) => {
        booklist(defaultRelays, (e) => {
                const foundTag = e.tags.find((tag) => tag[0] === "e");
                if (foundTag) {
                    e.id = foundTag[1];
                }
                cachedBooks.push({
                    id: e.id,
                    content: JSON.parse(e.content),
                    tags: e.tags,
                    created_at: e.created_at,
                    pubkey: e.pubkey
                });
        });

        bloglist(defaultRelays, (e) => {
            cachedBlogs.push({
                id: e.id,
                content:  e.content,
                tags: e.tags,
                created_at: e.created_at,
                pubkey: e.pubkey
            });
        });

        // 设置超时（避免无限等待）
        setTimeout(() => {
            console.log('Initialized books:', cachedBooks.length);
            console.log('Initialized blogs:', cachedBlogs.length);
            resolve();
        }, 3000); // 最长等待 3 秒
    });
}


function replaceHttpToHttps(url) {
    if (url.startsWith('http://')) {
        return 'https://' + url.slice(7);
    }
    return url;
}
const successfulUrls = new Set<string>();
// 生成 sitemap.xml 文件的函数
const generateSitemap = () => {
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${Array.from(successfulUrls).map(url => `  <url>
        <loc>${url}</loc>
    </url>`).join('\n')}
    </urlset>`;

    const filePath = path.join(process.cwd(), 'static', 'sitemap.xml');
    fs.writeFile(filePath, sitemapContent, (err) => {
        if (err) {
            console.error('生成 sitemap.xml 文件时出错:', err);
        } else {
            console.log('sitemap.xml 文件生成成功');
        }
    });
};
// 从 sitemap.xml 文件中读取 URL 并添加到 successfulUrls 集合
const loadUrlsFromSitemap = () => {
    const filePath = path.join(process.cwd(), 'static', 'sitemap.xml');
    if (fs.existsSync(filePath)) {
        const xmlContent = fs.readFileSync(filePath, 'utf-8');
        const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');
        const urlNodes = doc.getElementsByTagName('loc');
        for (let i = 0; i < urlNodes.length; i++) {
            const url = urlNodes[i].textContent;
            if (url) {
                successfulUrls.add(url);
            }
        }
    }
};


// 注入数据到每个请求
export const handle: Handle = async ({ event, resolve }) => {
    event.locals.books = cachedBooks; // 共享数据
    event.locals.blogs = cachedBlogs;
    const response = await resolve(event);
    const {url,method} = event.request;
    console.log(url,response.status)
    if (response.status == 200){
    	let url = event.url.toString();
	url = replaceHttpToHttps(url);
	if (!successfulUrls.has(url)){
		successfulUrls.add(url);
		generateSitemap();
	}
    }
    return response
};

// 启动时初始化（仅运行一次）
initializeDatas();
loadUrlsFromSitemap();
