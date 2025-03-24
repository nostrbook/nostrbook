
<script lang="ts">
    import { defaultRelays } from '$lib/config';
    import { booklist, read_book_chapter,createchapter } from '$lib/bookevent';
    import { getContext } from 'svelte';
    import { writable, get } from 'svelte/store';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';  
    import SimpleMDE  from '$lib/simpleMDE.svelte';  

   let isLoading = false;
   let saved = true;
   export let isWritebookOpen;
   export let bookId;
   export let bookTitle;
   let content;
   let contentset;
   let chapterTitle;
   let mdfilename;
   let dMessage= "正在加载...."
   let isOutline = false;

    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv;
    let Keypub;

    function addChapter() {
        isOutline = false;
        mdfilename = "";
         
        console.log('添加章节');
    }
    function editoutline(){
        isOutline = true;
        chapterTitle="大纲";
        mdfilename = "_sidebar.md";
    }

    function outlineexample(){
        contentset = `  * [第一章、 第一章标题](/chapter1.md)
        \n* [第二章、 第二章标题](/chapter2.md)`;
    }

    let tableOfContents = [
         
        
    ];
    function setLoading(state) {
        isLoading = state;
    }

    const closeWritebook = () => {
        if (saved == false){
            if (chapterTitle != "" && isOutline == false){
                 alert("请先保存数据");
                return ;
            }
            if (content !=""){
                alert("请先保存数据");
                return ;
            }
        }

        isWritebookOpen = false;
    };

    function get_tags(tags, tagName) {
        const urlEntry = tags.find(item => item[0] === tagName);
        return urlEntry[1];
    }

    function handlerchapter(e) {
        
        let title = get_tags(e.tags,'title');
        console.log(title)
        tableOfContents = [{title:title,id:e.id},...tableOfContents];
 
    }



    function editbook(bookid) {
        
        bookId = bookid;
        isWritebookOpen = true;
        
        setLoading(true);
        setTimeout(async () => {
            try {
                let ret = await read_book_chapter(defaultRelays, bookid, Keypub, handlerchapter);
                setTimeout(() => {
                    isLoading = false; 
                }, 3000);
            } catch (error) {
                console.error('读章节失败:', error);
            }
        }, 100);
    }    

    onMount(() => {
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);
    });


    async function CreateChapter (){
        if (isOutline == false){
            if (chapterTitle == ""){ alert("标题不能为空"); return;}
        }
        
        if (content == ""){ alert("内容不能为空"); return;}

        dMessage= "正在发布";
        isLoading = true;

        console.log(bookId);
        console.log(chapterTitle,content);
        setTimeout(async () => {
            try {
               let ret = await createchapter(defaultRelays,content,chapterTitle,mdfilename,bookId,Keypriv);
               saved = true;
               dMessage = "成功发布到 " + ret.size + "个服务器。" ;
               setTimeout(() => {
                    isLoading = false; 
                }, 3000);

            } catch (error) {
                console.error('上传失败:', error);
                dMessage = "上传失败 " + error;
                setTimeout(() => {
                    isLoading = false; 
                }, 3000);

            }  
        }, 100);
        
       
    }

    $: if (isWritebookOpen) {
        saved = false;
        tableOfContents = [
           
        ];

        editbook(bookId);
    }

    $: if (bookId) {
        chapterTitle = "";
        content = "";
    }

    $: if(chapterTitle){ saved=false;}
    $: if(content){ saved=false;}

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
        z-index: 1001;
         
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
            <div class="middle-toc flex flex-col relative">
                <p class="text-xl font-bold text-center text-sky-500 uppercase"> &lt;&lt; {bookTitle} &gt;&gt; </p>
                <div class="border-b border-gray-300 my-4"></div>



                <ul>
                  <li>
                    <!-- svelte-ignore a11y_invalid_attribute -->
                    <a href="" on:click= {() =>editoutline()} class="border border-gray-300 bg-blue-100 rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer">编写大纲 + </a>
                  </li>
                    {#each tableOfContents as toc}
                        <li>
                            <a href={toc.link}>{toc.title}</a>
                        </li>
                    {/each}
                </ul>
                 
                <button 
                 class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute bottom-2 " 
                on:click={addChapter}>
                    新增章节
                </button>
                
            </div>
            <div class="right-editor">
             {#if isOutline}
                <p class="flex items-center">
                    编写大纲内容  
                    <!-- svelte-ignore a11y_invalid_attribute -->
                    <a href="" on:click={() => outlineexample()} class="bg-blue-100 ml-2">查看样例</a>
                </p>
             {:else}

                <div class="flex items-center space-x-2">
                    <label for="title-input" class="font-bold">标题:</label>
                    <input type="text" bind:value={chapterTitle} id="title-input" placeholder="请输入标题" class="rounded-md mt-1 block w-4/5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                </div>
              {/if}   
               <div class="mt-4" style="height:80%;">
                  <SimpleMDE bind:content={content} bind:contentset={contentset}/>
               </div>
              
            <div class="flex items-center space-x-2">
                <label for="mdfile-input" class=" ">Markdown文件名:</label>
                <input type="text" bind:value={mdfilename} id="mdfile-input" placeholder="输入md文件名制作大纲:readme.md" class="rounded-md mt-1 block w-1/2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs">
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
                <span>{dMessage}</span>
            </div>
        </div>
    </div>
{/if}