import type { ServerLoad } from '@sveltejs/kit';

import {coverList} from '$lib/coverlist';

export const load: ServerLoad = async ({  }) => {
    return {
 
        coverList: coverList// 直接使用 hooks 注入的数据
    };
};
