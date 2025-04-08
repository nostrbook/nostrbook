 
  <script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import {icons} from '$lib/icons'
  import {  slide } from 'svelte/transition';
  import { defaultRelays } from '$lib/config';
  import {  read_chapter_docs } from '$lib/bookevent';
  
  let bookid = 0;
  let title;
  let likecount=0;
  let commentcount=0;
  let targetid;
  let targetpubkey;
  let openComment=false;
  let eventid; //chapter id;

    $: if (page){
        let pathname = $page.url.pathname;
        title = $page.url.searchParams.get('title')||"nostrBOOK";
        bookid = pathname.split("/books/")[1]
    }

  function getBookIdAndFileName() {
    const url = new URL(window.location.href);
    
    // 1. 提取 bookId（路径最后一部分）
    const pathParts = url.pathname.split("/");
    const bookId = pathParts[pathParts.length - 1]; // "f499c2fa0a987e5d1ff901a31cf701ea428d3da2edc6fdb78b81d9f0c1bb1c75"

    // 2. 提取 fileName（处理默认值）
    let fileName = "readme"; // 默认值
    if (url.hash.includes("#/")) {
      // 提取 #/ 后的内容，并去掉 ? 后面的参数
      fileName = url.hash.split("?")[0].substring(2) || "readme";
    }
    fileName = fileName + ".md";

    return { bookId, fileName };
  }


  onMount(async () => {
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
 
 

    window.$docsify = {
      name: title,
      loadSidebar: true,
      homepage: "readme.md",
      subMaxLevel:2,
      alias: {
          '/_sidebar.md': './_sidebar.md',
      }
    };

    const { bookId, fileName } = getBookIdAndFileName();
    function handleChapterEvent(e){
      eventid = e.id;
    }
    read_chapter_docs(defaultRelays,bookId,fileName,handleChapterEvent);

  });

  function gotoPage(href) {     
    window.location.href = `${href}`;
  }



  function handleLike(event) {
    if (event) event.preventDefault(); // 阻止默认行为（如需要）
 
    const { bookId, fileName } = getBookIdAndFileName();
    console.log(`点赞 bookId: ${bookId}, fileName: ${fileName}`);
  }

  function handleComment(event) {
    if (event) event.preventDefault(); // 阻止默认行为（如需要）
    // 获取 bookId 和 fileName
 
    openComment = true;

    const { bookId, fileName } = getBookIdAndFileName();
    console.log(`点赞 bookId: ${bookId}, fileName: ${fileName}`);
  }
  function closeComment(){
    openComment = false;
  }

  function getLikeAndComment(){
    const { bookId, fileName } = getBookIdAndFileName();
     
  }

  onMount(async () => {
    getLikeAndComment();
  })

  </script>
 <style>
  :global(body::before)  {
   background: none !important;
  }
 
  .app-nav a{
    display: flex;       /* 启用 Flex 布局 */
    align-items: center; /* 垂直居中对齐 */
    gap: 8px;           /* 图标和文字之间的间距 */
    color: #4a5568;     /* 默认文字颜色（gray-700） */
    text-decoration: none; /* 移除下划线 */
    transition: color 0.2s ease; /* 颜色过渡动画 */
  }

  .app-nav a > svg{
    width: 24px;        /* 图标宽度 */
    height: 24px;       /* 图标高度 */
    stroke: currentColor; /* 让 SVG 使用父元素的文字颜色 */
  }

        #comment-iframe {
            position: fixed;
            top: 0;
            bottom: 0;
            width: 20%;
            height: 100%;
            border-left: 1px solid #e2e8f0;
            box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
            background-color:#eee;
            z-index: 999;
            right: 0;
            
        }

        #close-iframe-button {
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            font-size: 18px;
        }

        #close-iframe-button:hover {
            color: #374151;
        }

        #comment-iframe iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

 </style>
 

  <nav class="app-nav">
  <ul>
    <li>
      <!-- svelte-ignore a11y_invalid_attribute -->
     <a href="#" on:click|preventDefault={gotoPage("/")} >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      <span> 回到主页<span>
     </a>
    </li>

   <li>
     <!-- svelte-ignore a11y_invalid_attribute -->
      <a href="#" title="点赞" on:click|preventDefault={handleLike}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
        </svg>
        <span>点赞 {likecount}</span>
      </a>
    </li>

    <li>
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a href="#" title="评论" on:click|preventDefault={handleComment}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span>评论 {commentcount}</span>
      </a>
    </li>
 
  </ul>
  </nav>

  <div id="app">Loading Docsify...
    <a href="/books/{bookid}/_sidebar.md?format=html">书本大纲内容</a>

  </div>
  {#if openComment}
    <div id="comment-iframe" transition:slide>
        <button id="close-iframe-button" on:click|preventDefault={closeComment}>
            ×
        </button>
        <iframe src="https://example.com/comments" title="comment"></iframe>
    </div>
  {/if}