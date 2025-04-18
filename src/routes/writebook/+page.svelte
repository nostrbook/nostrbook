<script lang="ts">
    import EditBook from '$lib/EditBook.svelte';
    import { onMount } from 'svelte';
    import { defaultRelays } from '$lib/config';
    import { booklist } from '$lib/bookevent';
    import { getContext } from 'svelte';
    import { writable, get } from 'svelte/store';
    import { page } from '$app/stores';

    let bookId;
    let bookTitle;

    let isWritebookOpen = false;


    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv;
    let Keypub;

    let books = [];
    let isLoading = true;

    function handlerBook(e) {
        let book = {
            id: e.id,
            content: JSON.parse(e.content),
            tags: e.tags,
            created_at: e.created_at,
            pubkey: e.pubkey
        };
        book.newid = book.id;
        //修正书籍的 老id
        const foundTag = e.tags.find((tag) => tag[0] === "e");
        if (foundTag) {
            book.id = foundTag[1];
        }

         
        books = [...books, book]; // 使用展开运算符更新数组
        
        isLoading = false;
    }

    function formatTimestamp(timestamp) {
        const date = new Date(String(timestamp).length < 13 ? timestamp * 1000 : timestamp);
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    onMount(() => {
        setLoading(true);
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);
        booklist(defaultRelays, handlerBook, Keypub);
        setTimeout(() => setLoading(false), 3000);
    });



    function navigateToCreateBook(href) {

        window.location.href = href;
    }



    function editbook(bookid, title,pubkey) {


        if (pubkey !== Keypub) return;
        
        bookId = bookid;
        bookTitle = title;
        isWritebookOpen = true;

    }

    function setLoading(state) {
        isLoading = state;
    }

    function handleImageError(event) {
        
        event.target.src = '/uploadfiles/?imgsrc='+event.target.src;
    }



    let hoveredBookId = null;

    function handleMouseEnter(bookId) {
        hoveredBookId = bookId;
        console.log(hoveredBookId)
    }

    function handleMouseLeave() {
        hoveredBookId = null;
    }

</script>

<style>

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
    }

    .info-content {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.375rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    div.clickable:hover {
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        transform: scale(1.05);
    }

   .book-card {
        position: relative;
        margin-bottom: 1rem;
    }

  .button-container {
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: none;
        flex-direction: column; /* 竖排显示按钮 */
        gap: 0.2rem; /* 缩小按钮之间的间距 */
        background-color: #f9fafb; /* 淡化背景颜色 */
        padding: 0.3rem;
        border-radius: 0.25rem;
        width: 60%;
        max-width: 200px;
        box-shadow: 0 15px 20px -3px rgba(0, 0, 0, 0.2), 0 6px 8px -2px rgba(0, 0, 0, 0.1);

    }

    /* 鼠标悬停时显示按钮容器 */
   .book-card:hover .button-container {
        display: flex;
    }

    /* 按钮样式 */
   .action-button {
        background-color: #ccc;
        color: #333; /* 调整文字颜色 */
        border: none;
        padding: 0.2rem 1rem; /* 减少上下方向的 padding 以降低按钮高度 */
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.875rem;
    }

   .action-button:hover {
        background-color: #0d5fd8;
        color:white;
    }

</style>

<div class="relative p-8 rounded-md">
    <!-- 创建新书按钮 -->
    <button class="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded inline-block" on:click={ ()=>navigateToCreateBook('/createbook')}>
        创建新书
    </button>
</div>

{#if books.length === 0 && !isLoading}
    <p class="text-gray-700">您还没有开始写书哦，点击右上角的“创建新书”按钮来开始创作之旅吧！</p>
{/if}

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each books as book}
        <div
            class="book-card mb-4 clickable"
             
            on:mouseenter={() => handleMouseEnter(book.id)}
            on:mouseleave={handleMouseLeave}
            role="button"
            tabindex="0"
            on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    editbook(book.id, book.pubkey);
                }
            }}
        >
            <img src="/uploadfiles/?imgsrc={book.content.coverurl}"  alt={`${book.content.title} 的封面图片`}  class="w-full aspect-square" style="width: 100%; aspect-ratio: 260 / 300; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; border-bottom-left-radius: 0; border-bottom-right-radius: 0;">
            <div class="p-2 bg-gray-100 border border-gray-300" style="border-bottom-left-radius: 0.375rem; border-bottom-right-radius: 0.375rem; border-top-left-radius: 0; border-top-right-radius: 0;">
                <h3 class="text-lg font-bold mb-1">{book.content.title}</h3>
                <div class="flex justify-between items-center text-sm">
                    <p class="truncate text-gray-600 flex-grow mr-2">作者: {book.content.author}</p>
                    <p class="text-gray-500 text-xs whitespace-nowrap">{formatTimestamp(book.created_at)}</p>
                </div>
            </div>

        {#if hoveredBookId === book.id}
            <div class="button-container">
                <button class="action-button" on:click={()=> navigateToCreateBook('/createbook?bookid='+book.newid)}>调整封面</button>
                <button class="action-button" on:click={() => editbook(book.id,book.content.title,book.pubkey)}>撰写书籍</button>
            </div>
        {/if}
        </div>


    {/each}
</div>

 
<EditBook  bind:isWritebookOpen={isWritebookOpen} bookId={bookId} bookTitle={bookTitle}/>
 

{#if isLoading}
    <div class="info-modal">
        <div class="info-content">
            <div class="flex items-center">
                <div class="loading-spinner mr-3"></div>
                <span>正在加载，请稍候...</span>
            </div>
        </div>
    </div>
{/if}
