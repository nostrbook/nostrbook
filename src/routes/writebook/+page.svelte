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
    //$: bookId = $page.url.searchParams.get('bookId');

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
        if (e.created_at >= 1742537924) {
            books = [...books, book]; // 使用展开运算符更新数组
        }
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



    function navigateToCreateBook() {
        window.location.href = '/createbook';
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
</style>

<div class="relative p-8 rounded-md">
    <!-- 创建新书按钮 -->
    <button class="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded inline-block" on:click={navigateToCreateBook}>
        开启创作
    </button>
</div>

{#if books.length === 0 && !isLoading}
    <p class="text-gray-700">您还没有开始写书哦，点击右上角的“开启创作”按钮来开始创作之旅吧！</p>
{/if}

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
    {#each books as book}
        <div
            class="mb-4 clickable"
            on:click={() => editbook(book.id,book.content.title,book.pubkey)}
            role="button"
            tabindex="0"
            on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    editbook(book.id, book.pubkey);
                }
            }}
        >
            <img src={book.content.coverurl} alt={`${book.content.title} 的封面图片`} class="w-full aspect-square" style="width: 100%; aspect-ratio: 260 / 300; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; border-bottom-left-radius: 0; border-bottom-right-radius: 0;">
            <div class="p-2 bg-gray-100 border border-gray-300" style="border-bottom-left-radius: 0.375rem; border-bottom-right-radius: 0.375rem; border-top-left-radius: 0; border-top-right-radius: 0;">
                <h3 class="text-lg font-bold mb-1">{book.content.title}</h3>
                <div class="flex justify-between items-center text-sm">
                    <p class="truncate text-gray-600 flex-grow mr-2">作者: {book.content.author}</p>
                    <p class="text-gray-500 text-xs whitespace-nowrap">{formatTimestamp(book.created_at)}</p>
                </div>
            </div>
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