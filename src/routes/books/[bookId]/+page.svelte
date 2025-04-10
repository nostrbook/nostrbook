 
  <script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import {icons} from '$lib/icons'
  import {  slide } from 'svelte/transition';
  import { defaultRelays } from '$lib/config';
  import {  read_chapter_docs ,get_comments_chapter,like_chapter,comment_chapter} from '$lib/bookevent';
  import {WebStorage} from '$lib/WebStorage'
  import {   getPublicKey } from 'nostr-tools/pure'
      
 
  let Keypriv;
  let Keypub;
  
  let bookid = 0;
  let title;
  let likecount=0;
  let liked = false;
  let isVote;
  let commentcount=0;
  let comments = [];
  let targetid;
  let targetpubkey;
  let openComment=false;
  let commentInputValue = ''; 



  function getBookIdAndFileName(url1) {
    let url;
    if (!url1){
      url = new URL(window.location.href);
    } else {
      url = url1;
    }
    
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

  function handleCommentEvent(e){
      console.log(e) 
      if (e.kind == 7){
        likecount += 1
        if (e.pubkey == Keypub) { 
          liked = 1
          isVote = e;
        }
      }

      if (e.kind == 1){
        if (e.tags.find((tag) => tag[0] === "t")){
          //comment 
          commentcount += 1;
          comments.push(e);
        }
      }
  }
    


  onMount(async () => {

    let storage = new WebStorage(localStorage);
    let keyPrivhex = storage.get("keyPriv");
      
    if (keyPrivhex != null){
        const numArray = keyPrivhex.split(',').map(Number);
        Keypriv = new Uint8Array(numArray)
        Keypub = getPublicKey(Keypriv) // `pk` is a hex string
    }

         
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

 
 

    get_comments_chapter(defaultRelays,bookId,fileName,handleCommentEvent);

  });

  function gotoPage(href) {     
    window.location.href = `${href}`;
  }



  async function handleLike(event) {
    if (event) event.preventDefault(); // 阻止默认行为（如需要）
 
    const { bookId, fileName } = getBookIdAndFileName();

    isVote = await like_chapter(defaultRelays,bookId,fileName ,isVote,Keypriv);

    if (liked == 0){
      liked = 1;
       
    } else {
      liked = 0;
    }
      
  }

  function handleComment(event) {
    if (event) event.preventDefault(); // 阻止默认行为（如需要）
    // 获取 bookId 和 fileName
 
    openComment = true;



  }

  async function CommentSumbit(event){
    
    const { bookId, fileName } = getBookIdAndFileName();
    console.log(`点赞 bookId: ${bookId}, fileName: ${fileName}`);
    const commentContent = commentInputValue;
    console.log('用户输入的评论内容:', commentContent);

    await comment_chapter(defaultRelays,bookId,fileName,commentContent,Keypriv);

    // 例如，清空 commentInputValue
    commentInputValue = '';
  }

  function closeComment(){
    openComment = false;
  }

    $: if ($page){
        let pathname = $page.url.pathname;
        title = $page.url.searchParams.get('title')||"nostrBOOK";
        bookid = pathname.split("/books/")[1]

    }

    let oldmdfile;
    $: if($page.url){

       const {bookId,fileName} = getBookIdAndFileName($page.url);
       
       if ( oldmdfile && oldmdfile != fileName){

          likecount    = 0;
          liked        = false;
          isVote       = null;
          commentcount = 0;
          comments     = [];
          console.log(oldmdfile,fileName);
          get_comments_chapter(defaultRelays,bookId,fileName,handleCommentEvent);
       
      }
      oldmdfile = fileName;

    }
 
 

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

  
 

    /* 主容器样式 */
    .comment-container {
        display: flex; 
        flex-direction: column; 
        height: 100%;
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        position: relative;
    }

    /* 关闭按钮 */
    .close-button {
        position: absolute;
        top: 10px;
        right: 15px;
        background: rgba(0, 0, 0, 0.2);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        color: white;
        transition: all 0.3s ease;
        z-index: 1000;
    }

    .close-button:hover {
        background: rgba(0, 0, 0, 0.3);
        transform: scale(1.1);
    }
    /* 评论展示区域 */
    .comments-display-container {
        flex: 1; 
        overflow-y: auto; 
        margin-bottom: 15px;
        margin-top:35px;
        padding: 10px;
        border-radius: 6px;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
    }

    /* 单个评论项样式 */
    .comment-item {
        padding: 10px;
        border-bottom: 1px solid #eee;
        margin-bottom: 10px;
    }

    .comment-author {
        font-weight: bold;
        margin-bottom: 5px;
        color: #343a40;
    }

    .comment-content {
        margin-bottom: 5px;
        color: #495057;
    }

    .comment-time {
        font-size: 0.8rem;
        color: #6c757d;
    }

    /* 输入区域 */
    .comment-input-area {
        margin-top: auto; 
        padding-top: 15px;
        border-top: 1px solid #e9ecef;
    }

    /* 文本输入框 */
    .comment-textarea {
        width: 100%;
        border: 2px solid #e9ecef;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
        resize: none;
        height: 80px;
        box-sizing: border-box;
        font-family: inherit;
        transition: all 0.3s ease;
    }

    .comment-textarea:hover {
        border-color: #adb5bd;
    }

    .comment-textarea:focus {
        border-color: #106eea;
        box-shadow: 0 0 0 3px rgba(16, 110, 234, 0.2);
        outline: none;
    }

    /* 提交按钮 */
    .submit-button {
        width: 100%;
        background-color: #106eea;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 12px 16px;
        cursor: pointer;
        font-weight: 500;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .submit-button:hover {
        background-color: #0d5fd8;
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .submit-button:active {
        transform: translateY(1px);
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
      <a href="#" title="点赞" on:click|preventDefault={handleLike} style="color: {liked === 1? 'crimson' : 'inherit'};">
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
    <div id="comment-iframe" transition:slide class="comment-container">
        <button  on:click|preventDefault={closeComment} class="close-button">
            ×
        </button>
        
        <div class="comments-display-container">
            <!-- 评论展示区域 -->
            <div id="comments-display">
                <!-- 这里会动态显示评论内容 -->
                
                {#each comments as comment}
                <div class="comment-item">
                    <span class="comment-author">作者: {comment.pubkey.slice(0, 8)}...</span>
                    <p class="comment-content">{comment.content}</p>
                    <span class="comment-time">时间: {new Date(comment.created_at * 1000).toLocaleString()}</span>
                </div>
                {/each}
                 
            </div>
        </div>
        
        <div class="comment-input-area">
            <textarea 
                id="comment-input" 
                placeholder="请输入您的评论..." 
                class="comment-textarea"
                bind:value={commentInputValue}
            ></textarea>
            
            <button 
                id="comment-submit" 
                on:click|preventDefault={CommentSumbit} 
                class="submit-button"
            >
                提交评论
            </button>
        </div>
    </div>
{/if}
