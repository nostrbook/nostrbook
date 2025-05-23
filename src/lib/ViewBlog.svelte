<script lang="ts">
     
    import { getContext ,afterUpdate} from'svelte';
    import { writable, get } from'svelte/store';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { processMarkdownImages,codeCopy} from '$lib/docsify_plugin';
 

    export let isViewblogOpen: boolean;
    export let blogItem;
    let compiledContent;
    let blogid;

    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv;
    let Keypub;
 

    const closeViewblog = (ischeck: number): void => {
        
        isViewblogOpen = false;
        window.location.href = "/blog";
    };

    onMount(async () => {

        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);
    
        // 动态加载 CSS
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = '/static/css/vue.css';
        document.head.appendChild(css);

        // 动态加载 JS
        const js = document.createElement('script');
        js.src = '/static/js/docsify.min.js';
        document.body.appendChild(js);

        const styleElements = document.getElementsByTagName('style');
        let targetStyleElement = null;
        for (let i = 0; i < styleElements.length; i++) {
            const element = styleElements[i];
            const dataViteDevId = element.getAttribute('data-vite-dev-id');
            if (dataViteDevId && dataViteDevId.includes('app.css')) {            
                element.parentNode.removeChild(element);
                break;
            }
        }
    
 

    });

    function formatTimestamp(timestamp) {
        if (String(timestamp).length < 13) {
            timestamp = timestamp * 1000;
        }
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

   $: if (blogItem) { 
 
        let precontent = processMarkdownImages(blogItem.content);
        compiledContent = window.__current_docsify_compiler__.compile(precontent);
         
    }

    let container;
    
    afterUpdate(() => {
        if (container?.innerHTML) {
            codeCopy();
        }
    });

 
    function handleImageError(event) {
        
        event.target.src = '/uploadfiles/?imgsrc='+event.target.src;
    }

    $: if ($page){
        let pathname = $page.url.pathname;
        blogid = pathname.split("/blog/")[1]
    }

</script>

<style>
    /* 覆盖层样式 */
    .viewblog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
         
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    /* 关闭按钮 */
    .close-button {
        position: absolute;
        top: 0.5rem;
        right: 1.5rem;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background-color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1001;
        border: none;
        font-size: 1.5rem;
        color: #333;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        border: 1px solid #5599ff;
    }
    
    .close-button:hover {
        background-color: #f0f0f0;
        transform: scale(1.1);
    }
    
    /* 主容器 */
    .viewblog-container {
        display: flex;
        flex-direction: column;
        width: min(90%, 1000px);
        height: min(90vh, 800px);
        background-color: white;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    /* 头部区域 - 图片左/内容右布局 */
    .blog-header {
        display: flex;
        padding: 2rem;
        gap: 2rem;
        border-bottom: 1px solid #f0f0f0;
        align-items: flex-start;
    }
    
    .blog-cover-container {
        flex: 0 0 200px;
    }
    
    .blog-cover {
        width: 200px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    }
    
    .blog-cover:hover {
        transform: scale(1.03);
    }
    
    .blog-title-container {
        flex: 1;
        text-align: left; /* 确保标题左对齐 */
    }
    
    .blog-title {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 0.5rem; /* 减少与下方元素的间距 */
        color: #222;
        line-height: 1.3;
        text-align: left; /* 标题左对齐 */
    }
    
    .blog-meta {
        color: #666;
        font-size: 0.9rem;
        display: flex;
        flex-direction: column; /* 改为垂直排列 */
        gap: 0.3rem; /* 减少行间距 */
        margin-bottom: 0.5rem;
    }
    
    .meta-line {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .meta-icon {
        width: 14px;
        height: 14px;
        opacity: 0.7;
    }
    
    /* 内容区域 */
    .blog-content {
        padding: 2rem;
        overflow-y: auto;
        flex: 1;
        line-height: 1.8;
        color: #333;
        text-align: left; /* 内容左对齐 */
    }
    
    /* 保留原有的Markdown内容样式 */
    .blog-content :global(h1),
    .blog-content :global(h2),
    .blog-content :global(h3) {
        margin-top: 1.5em;
        margin-bottom: 0.8em;
        color: #222;
        text-align: left; /* 标题左对齐 */
    }
    
    /* 其他Markdown样式保持不变... */
    
    /* 响应式设计 */
    @media (max-width: 768px) {
        .blog-header {
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.5rem;
        }
        
        .blog-cover-container {
            align-self: flex-start; /* 图片也左对齐 */
        }
        
        .blog-title {
            font-size: 1.6rem;
        }
        
        .blog-content {
            padding: 1.5rem;
        }
    }
    
    @media (max-width: 480px) {
        .blog-cover {
            width: 160px;
            height: 120px;
        }
    }

    :global {
        ol {
                list-style-type: decimal;
            }

            /* 这是无序列表的样式，这里不做修改，保持默认的圆点显示 */
        ul {
                list-style-type: disc;
            }
      #main img {
        max-width: 60%;
      }  
    .user-img {
         
        height: auto;
        border: 1px solid #ccc;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    }

    .user-img:hover {
        transform: scale(1.01);
    }
           
    }


</style>

{#if isViewblogOpen}
    <div class="viewblog-overlay">

        <div class="viewblog-container">
        <button class="close-button" on:click={closeViewblog} aria-label="关闭编辑器">
            ×
        </button>
            <div class="blog-header">
                {#if blogItem.cover}
                <div class="blog-cover-container">
                    <img src={blogItem.cover} alt={blogItem.title} class="blog-cover" on:error={handleImageError} />
                </div>
                {/if}
                <div class="blog-title-container">
                    <h1 class="blog-title">{blogItem.title}</h1>
                    <div class="blog-meta">
                        <div class="meta-line">
                            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>发布时间: {formatTimestamp(blogItem.created_at)}</span>
                        </div>
                        <div class="meta-line">
                            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>作者: {blogItem.pubkey.slice(0,10)}...</span>
                        </div>
                        <div class="meta-line">
                            <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            <a href="/blog/{blogid}/raw" target="_blank">
                                查看原文
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="blog-content">
                <article class="markdown-section" id="main" bind:this={container}>
                     {@html compiledContent}
                </article>
            </div>
        </div>
    </div>
{/if}