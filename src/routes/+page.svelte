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

    let bookstemp = [];
    let books = [];

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

    onMount(() => {
        
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);
         
        return () => {
           
        };
    });

</script>

<style lang="postcss">
    /* 自定义渐变色类 */
    .text-gradient {
        background: linear-gradient(45deg, #c4b5fd, #c026d3);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
</style>

<h1 class="text-3xl font-bold mb-4 text-gradient">
    nostrBOOK 诺友书屋
</h1>
<hr class="my-4 border-gray-300">

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
    {#each books as book}
        <div class="mb-4">
           <img src={book.content.coverurl} alt="封面图片预览" class="w-full aspect-square" style="width: 100%; aspect-ratio: 260 / 300; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; border-bottom-left-radius: 0; border-bottom-right-radius: 0;">
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