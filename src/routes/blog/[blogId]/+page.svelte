
<script lang="ts">
    import { onMount } from 'svelte';
    import { defaultRelays } from '$lib/config';
    import { readblog } from '$lib/bookevent';
    import { getContext } from 'svelte';
    import { writable, get } from 'svelte/store';
    
    import ViewBlog from '$lib/ViewBlog.svelte';
    
    let blogItem;
    let isViewblogOpen = false;
    let isLoading = true;

    //from +page.server.ts 
    export let data;
    
    function randthumbnail(img){
        if (!img)
            img = data.coverList;

        var length = img.length - 1;

        var rand = Math.floor(Math.random() * Math.floor(length));

        return img[rand]
    }

    function getBlogId(url1) {
        let url;
        if (!url1){
        url = new URL(window.location.href);
        } else {
        url = url1;
        }
        
        // 1. 提取 blogId（路径最后一部分）
        const pathParts = url.pathname.split("/");
        const blogId = pathParts[pathParts.length - 1];
    
        return blogId;
    }

    function get_tag(tags,tagName){
        const urlEntry = tags.find(item => item[0] === tagName);
        return urlEntry? urlEntry[1] : null; // 如果没找到则返回 null
    }

    function handlerBlog(e) {
        
        isLoading = false;
      
        e.title   = get_tag(e.tags, "title") 
        let cover = get_tag(e.tags, "cover");
        e.cover   = cover ? cover : randthumbnail();       
        blogItem = e;
        isViewblogOpen = true;
 
    }
    onMount(async () => {
        let blogid = getBlogId();

        readblog(defaultRelays,blogid,handlerBlog);
    })

</script>    

<style lang="postcss">
    /* 全局样式 */
 

    /* 加载动画样式 */
    .loading-spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-left-color: #000;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* 模态框样式 */
    .info-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

</style>

<ViewBlog bind:isViewblogOpen={isViewblogOpen} {blogItem} />

{#if isLoading}
    <div class="info-modal">
        <div class="info-content">
            <div class="flex items-center">
                <div class="loading-spinner mr-3"></div>
                <span>正在加载</span>
            </div>
        </div>
    </div>
{/if}