

<script lang="ts">
   
    import { onMount } from 'svelte'; 
    import {  defaultRelays} from '$lib/config';
    import { booklist} from '$lib/bookevent';
    import { getContext } from 'svelte';
    import { writable, get } from 'svelte/store';
     

    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv;
    let Keypub;

    export let data; // 自动注入 load 返回的数据
    

    let bookstemp = [];
    let books = data.books;
    let isLoading = false;
    function handlerBook(e){
        
        let book = {};
        book.id = e.id
        book.content = JSON.parse(e.content)
        book.tags = e.tags
        book.created_at = e.created_at
        book.pubkey = e.pubkey
        if (e.created_at >= 1742537924){
            bookstemp.push(book) 
        }
        // 渲染事件必须监听到books变化才会做网页渲染push 不会重新改变 books
        books = bookstemp;
        isLoading = false;
        
    }


 
    function gobooks(bookid,title){
        window.location.href = "/books/" +bookid + "?title="+title;
    }
    function formatTimestamp(timestamp) {
        if (String(timestamp).length < 13) {
            timestamp = timestamp * 1000;
        }
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    booklist(defaultRelays,handlerBook);
     
    setTimeout(()=>{isLoading = false;},5000)

    function handleImageError(event) {
        
        event.target.src = '/uploadfiles/?imgsrc='+event.target.src;
    }

    onMount(() => {
        
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);
         
        return () => {
           
        };
    });

</script>

<style lang="postcss">
 


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

    
<div class="flex justify-center items-center">
        <img src="/banner.png" alt="banner" class="rounded-md" style="height:100px;">

</div>

       

<hr class="my-4 border-gray-300">

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >

 
    {#each books as book}
        <div class="mb-4  clickable "        
            on:click={() => gobooks(book.id,book.content.title)}
            role="button"
            tabindex="0"
            on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    gobooks(book.id ,book.content.title);
                }
            }} >

           <img src="/uploadfiles/?imgsrc={book.content.coverurl}"    alt="封面图片预览" class="w-full aspect-square" style="width: 100%; aspect-ratio: 260 / 300; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; border-bottom-left-radius: 0; border-bottom-right-radius: 0;">
            <div class="p-2  bg-gray-100 border border-gray-300" style="border-bottom-left-radius: 0.375rem; border-bottom-right-radius: 0.375rem; border-top-left-radius: 0; border-top-right-radius: 0;">
                <h3 class="text-lg font-bold mb-1">{book.content.title}</h3>
                <div class="flex justify-between items-center text-sm">
                    <p class="truncate text-gray-600 flex-grow mr-2">作者:{book.content.author}</p>
                    <p class="text-gray-500 text-xs whitespace-nowrap">{formatTimestamp(book.created_at)}</p>
                </div>
            </div>
        </div>
    {/each}
</div>

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
