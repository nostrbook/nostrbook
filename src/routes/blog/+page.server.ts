import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
    return {
        books: locals.books // 直接使用 hooks 注入的数据
    };
};
