
<script lang="ts">
    import { defaultRelays } from '$lib/config';
    import { booklist, read_book_chapter } from '$lib/bookevent';
    import { getContext } from 'svelte';
    import { writable, get } from 'svelte/store';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';  
    import SimpleMDE  from '$lib/simpleMDE.svelte';  

   let isLoading = false;
   export let isWritebookOpen;
   export let bookId;
   let content;
   let chapterTitle;

    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv;
    let Keypub;

    function addChapter() {
        // 这里可以添加实际的添加章节逻辑
        console.log('添加章节');
    }

    function generateOutline() {
        // 这里可以添加实际的生成大纲逻辑
        console.log('生成大纲');
    }

    const tableOfContents = [
        { title: "第一章", link: "/chapter/" },
        
    ];
    function setLoading(state) {
        isLoading = state;
    }

    const closeWritebook = () => {
        isWritebookOpen = false;
    };

    function handlerchapter(e) {
        console.log(e);
    }

    function editbook(bookid) {
        
        bookId = bookid;
        isWritebookOpen = true;
        
        setLoading(true);
        setTimeout(async () => {
            try {
                let ret = await read_book_chapter(defaultRelays, bookid, Keypub, handlerchapter);
            } catch (error) {
                console.error('加载章节失败:', error);
            } finally {
                setLoading(false);
            }
        }, 100);
    }    

    onMount(() => {
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);
    });


    function CreateChapter(){
        console.log(chapterTitle,content);
    }

    $: if (isWritebookOpen) {
        editbook(bookId);
    }

</script>


<style>

    .writebook-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .writebook-container {
        display: flex;
        width: 80%;
        height: 80vh;
        background-color: white;
        border-radius: 10px;
        overflow: hidden;
    }



    a:hover {
        background-color: #f0f0f0;
    }


   .middle-toc {
        width: 25%;
        background-color: #e0e0e0;
        padding: 10px;
        border-radius: 10px 0 0 10px;
        margin: 10px 0 10px 10px;
    }

    .right-editor {
        width: 75%;
        background-color: white;
        padding: 10px;
        border-radius: 0 10px 10px 0;
        margin: 10px 10px 10px 0;
        border-left: 1px solid #ccc;
    }

    .close-button {
        position: relative;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
    }

    .close-button span:first-child {
        font-size: 20px; /* 可以根据实际情况调整大小 */
        display: inline-block;
        width: 30px; /* 可以根据实际情况调整宽度 */
        height: 30px; /* 可以根据实际情况调整高度 */
        line-height: 30px; /* 使 “×” 垂直居中 */
        text-align: center;
        background-color: #ccc; /* 添加背景颜色，这里用灰色示例，可按需修改 */
        border-radius: 50%; /* 使背景呈圆形 */
        margin-right: 5px; /* 调整 “×” 和文字的间距 */
    }

    .close-button span.sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        margin-bottom: 8px;
    }

    a {
        text-decoration: none;
        color: #333;
        display: block;
        padding: 8px 12px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }

    a:hover {
        background-color: #f0f0f0;
    }

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

    input:focus {
	    border: 1px solid #d4237a; /*  */
    }

</style>


{#if isWritebookOpen}
 
    <div class="writebook-overlay">
        <button class="close-button" on:click={closeWritebook}>
            <span aria-hidden="true">×</span>
            <span class="sr-only">关闭</span>
        </button>
        <div class="writebook-container">
            <div class="middle-toc">
                <button 
                 class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2" 
                on:click={addChapter}>
                    新增章节
                </button>
                <button 
                    class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" 
                    on:click={generateOutline}>
                    生成大纲
                </button>

                <ul>
                    {#each tableOfContents as toc}
                        <li>
                            <a href={toc.link}>{toc.title}</a>
                        </li>
                    {/each}
                </ul>
            </div>
            <div class="right-editor">
                <div class="flex items-center space-x-2">
                    <label for="title-input" class="font-bold">标题:</label>
                    <input type="text" bind:value={chapterTitle} id="title-input" placeholder="请输入标题" class="rounded-md mt-1 block w-4/5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                </div>
               <div class="mt-4" style="height:90%;">
                  <SimpleMDE bind:content={content}/>
               </div>
                <div class="flex justify-end mt-1">
                    <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" on:click={CreateChapter}>提交</button>
                </div>
            </div>
        </div>
    </div>
 
{/if}


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