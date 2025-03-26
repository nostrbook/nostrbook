<script lang="ts">
    import { defaultRelays } from '$lib/config';
    import { booklist, read_book_chapters, createchapter, read_chapter, updatechapter } from '$lib/bookevent';
    import { getContext } from 'svelte';
    import { writable, get } from 'svelte/store';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';  
    import SimpleMDE from '$lib/simpleMDE.svelte';  
  

    // 状态管理
    let isLoading = false;
    let saved = true;
    export let isWritebookOpen: boolean;
    export let bookId: string;
    export let bookTitle: string;
    
    let content: string = "";
    let contentset: string = "";
    let chapterTitle: string = "";
    let mdfilename: string = "";
    let dMessage: string = "正在加载....";
    let isOutline: boolean = false;
    let eventOutline ;
    let eventupdate ;
    let newchapter: boolean = false;

    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv: string;
    let Keypub: string;

    let tableOfContents=[];
    let timeTOC = [];
    let outlineTOC= [];
    let chapterMenu = "outline";

    function handleSortChange(val){
           chapterMenu = val;

           if (val == "time") {
             tableOfContents = timeTOC;
           } 
           if (val == "outline") {
             tableOfContents = outlineTOC;
           } 
           console.log(tableOfContents);
           
    }

    function updateTOC(TOC, newItem) {
        return outlineTOC.map(item => {
             
            if (item.file === newItem.file) {
                return { ...item, id: newItem.id };
            }
            return item;  
        });
    }
    // 工具函数
    function getTag(tags: string[][], tagName: string): string {
        const tagEntry = tags.find(item => item[0] === tagName);
        return tagEntry ? tagEntry[1] : "";
    }

    // 章节操作
    function addChapter(): void {
        isOutline = false;
        mdfilename = "";
        chapterTitle = "";
        content = "";
        contentset = "";
        newchapter = true;
    }

    function editoutline(): void {
        isOutline = true;
        chapterTitle = "大纲";
        content = "";
        mdfilename = "_sidebar.md";
        
        if (eventOutline) {
            contentset = eventOutline.content;
            eventupdate = eventOutline;
            newchapter = false;
        } else {
            newchapter = true;
        }
    }

    function outlineexample(): void {
        contentset = `- [首页](/readme.md)
        \n- [第一章、 第一章标题](/chapter1.md)
        \n- [第二章、 第二章标题](/chapter2.md)`;
    }

    function setLoading(state: boolean): void {
        if (state == true) dMessage = "正在加载";
        isLoading = state;
    }

    // 关闭书籍编辑器
    const closeWritebook = (ischeck: number): void => {
        if (ischeck === 0) {
            isWritebookOpen = false; 
            window.location.reload();
            return;
        }
        
        // 检查是否保存
        if (!saved) {
            if ((chapterTitle !== "" && !isOutline) || content !== "") {
                alert("请先保存数据");
                return;
            }
        }
        window.location.reload();
        isWritebookOpen = false;
    };

    // 事件处理
    function handlerbookchapters(e): void {
        console.log(e)
        const title = getTag(e.tags, 'title');
        const filename = getTag(e.tags, 'd').split("-")[0];
        console.log(title,filename)

        if (filename === "_sidebar.md") {
            eventOutline = e;
            format_sidebar();
            //更新 outlineTOC id
            timeTOC.map(item => { outlineTOC = updateTOC(outlineTOC,item)})
            tableOfContents = outlineTOC;
            
            return;
        }
        timeTOC = [{title:title,id:e.id,file:filename},...timeTOC];
        outlineTOC = updateTOC(outlineTOC,{title:title,id:e.id,file:filename});
        tableOfContents= updateTOC(tableOfContents,{title:title,id:e.id,file:filename});
         
    }

    function format_sidebar(){
        let text = eventOutline.content;
        console.log(text)
        const regex = /\[([^\]]+)\]\(([^)]+)\)/g; 
        let matches;
        let results = [];
        while ((matches = regex.exec(text)) !== null) {
            const title = matches[1];    // 方括号内的标题（如 "第一章、 第一章标题"）
            const mdFile = matches[2];   // 圆括号内的 .md 文件名（不含 /，如 "chapter1"）
            
            results.push({ title, file:mdFile.split('/').pop(),id:""});
        }
        outlineTOC = results;
        // default 显示 大纲里内容
     
         
    }

    function handler_one_chapter(e): void {
        chapterTitle = getTag(e.tags, 'title');
        mdfilename = getTag(e.tags, 'd').split("-")[0];
        contentset = e.content;
        eventupdate = e;
    }

    // 编辑操作
    async function editchapter(chapterid: string,filename:string): Promise<void> {
        isOutline = false;
        chapterTitle="";
        contentset="";
        mdfilename="";
        
        if (chapterid==""){
            dMessage  = "没有对应的章节ID";
            isLoading = true;
            setTimeout(()=>{
                isLoading = false;
            },3000);
            return ;
        }

        setLoading(true);
        try {
            await read_chapter(defaultRelays, bookId,chapterid, Keypub, handler_one_chapter);
        } catch (error) {
            console.error('读取章节失败:', error);
            dMessage = "读取章节失败";
        } finally {
            setTimeout(() => isLoading = false, 3000);
        }
    }

    async function editbook(bookid: string): Promise<void> {
        bookId = bookid;
        isWritebookOpen = true;
        
        setLoading(true);
        try {
            await read_book_chapters(defaultRelays, bookId, Keypub, handlerbookchapters);
        } catch (error) {
            console.error('读取章节失败:', error);
            dMessage = "读取书籍章节失败";
        } finally {
            setTimeout(() => isLoading = false, 3000);
        }
    }

    // 创建/更新章节
    async function createChapter(): Promise<void> {
        if (!isOutline && chapterTitle === "") {
            alert("标题不能为空");
            return;
        }
        
        if (content === "") {
            alert("内容不能为空");
            return;
        }

        let hasSameFilename = false;
        for (let item of timeTOC) {
            if (item.file === mdfilename) {
                hasSameFilename = true;
                break;
            }
        }
        if (hasSameFilename){
            alert("有相同的文件名:"+mdfilename+",请更换markdown文件名！");
            return ;
        }

        dMessage = "正在发布";
        isLoading = true;

        try {
            const ret = await createchapter(defaultRelays, content, chapterTitle, mdfilename, bookId, Keypriv);
            saved = true;
            dMessage = `成功发布到 ${ret.size} 个服务器。`;
            
            // 如果是新章节，添加到目录
            if (!isOutline) {
                tableOfContents.push({
                    title: chapterTitle,
                    id: ret.id || "",
                    file: mdfilename
                });
            }
        } catch (error) {
            console.error('上传失败:', error);
            dMessage = `上传失败: ${error instanceof Error ? error.message : String(error)}`;
        } finally {
            setTimeout(() => isLoading = false, 3000);
        }
    }

    async function updateChapter(): Promise<void> {
        if (!isOutline && chapterTitle === "") {
            alert("标题不能为空");
            return;
        }
        
        if (content === "") {
            alert("内容不能为空");
            return;
        }

        dMessage = "正在发布";
        isLoading = true;

        try {
            
            const ret = await updatechapter(defaultRelays, content, chapterTitle, mdfilename, bookId, Keypriv);
            saved = true;
            dMessage = `成功发布到 ${ret.size} 个服务器。`;
        } catch (error) {
            console.error('上传失败:', error);
            dMessage = `上传失败: ${error instanceof Error ? error.message : String(error)}`;
        } finally {
            setTimeout(() => isLoading = false, 3000);
        }
    }

    function submitChapter(): void {
        if (newchapter) {
            createChapter();
        } else {
            updateChapter();
        }
        newchapter = false;
    }

    // 响应式语句
    $: if (isWritebookOpen) {
        saved = false;
        tableOfContents.length = 0; // 清空数组
        editbook(bookId);
    }

    $: if (bookId) {
        chapterTitle = "";
        content = "";
    }

    $: if (chapterTitle) { saved = false; }
    $: if (content) { saved = false; }

    // 组件挂载
    onMount(() => {
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);
    });
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
        width: min(90%, 1200px);
        height: min(90vh, 800px);
        background-color: white;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
    }

    .middle-toc {
        width: 25%;
        background-color: #f8f9fa;
        padding: 1rem;
        overflow-y: auto;
    }

    .right-editor {
        width: 75%;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background-color: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1001;
        border: none;
        font-size: 1.2rem;
        color: #6c757d;
    }

    .close-button:hover {
        background-color: #e9ecef;
    }

    .editor-content {
        flex-grow: 1;
        min-height: 0;
        margin-bottom: 1rem;
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
        to { transform: rotate(360deg); }
    }

    .info-modal {
        position: fixed;
        inset: 0;
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

    .chapter-list {
        list-style: none;
        padding: 0;
        margin: 0;
        overflow-y: auto;
        flex-grow: 1;
    }

    .chapter-item {
        margin-bottom: 0.5rem;
    }

    .chapter-link {
        display: block;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        color: #495057;
        transition: background-color 0.2s;
    }

    .chapter-link:hover {
        background-color: #e9ecef;
        text-decoration: none;
    }

    .outline-example-link {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.5rem;
        background-color: #e7f5ff;
        border-radius: 0.25rem;
        color: #1971c2;
        margin-left: 0.5rem;
        font-size: 0.875rem;
    }



    .button-group {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;
    }

    .button {
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .button-primary {
        background-color: #1971c2;
        color: white;
        border: none;
    }

    .button-primary:hover {
        background-color: #1864ab;
    }

    .button-danger {
        background-color: #f03e3e;
        color: white;
        border: none;
    }

    .button-danger:hover {
        background-color: #e03131;
    }
 
    input:focus {
	    border: 1px solid #d4237a; /*  */
    }    
</style>

{#if isWritebookOpen}
    <div class="writebook-overlay">
        <button class="close-button" on:click={() => closeWritebook(1)} aria-label="关闭编辑器">
            ×
        </button>
        <div class="writebook-container">
            <div class="middle-toc">
                <h2 class="text-xl font-bold text-center text-sky-500 uppercase mb-4">
                    &lt;&lt; {bookTitle} &gt;&gt;
                </h2>
                <div class="border-b border-gray-300 my-2"></div>

                <div class="tabs tabs-box">
                    <input type="radio" name="my_tabs_1" class="tab" aria-label="大纲排列" checked="checked" on:click={() => handleSortChange('outline')}/>
                    <input type="radio" name="my_tabs_1" class="tab" aria-label="时间排列"  on:click={() => handleSortChange('time')}/>
                </div>
                            
                 <ul class="chapter-list">

                    {#each tableOfContents as toc}
                        <li class="chapter-item">
                               <!-- svelte-ignore a11y_invalid_attribute -->
                            <a 
                                href="#" 
                                on:click|preventDefault={() => editchapter(toc.id,toc.file)} 
                                class="chapter-link"
                            >
                                {toc.title}
                            </a>
                        </li>
                    {/each}
                </ul>
                
                <div class="flex items-center gap-3 mb-4 absolute bottom-2">
                    <!-- 新增章节按钮 -->
                    <button
                        class="flex items-center px-4 py-2 text-white bg-blue-400 hover:bg-blue-600 rounded-lg transition-colors shadow hover:shadow-md"
                        on:click={addChapter}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        新增章节
                    </button>

                    <!-- 编写大纲链接 -->
                    <!-- svelte-ignore a11y_invalid_attribute -->
                    <a
                        href="#"
                        on:click|preventDefault={editoutline}
                        class="flex items-center px-4 py-2 text-white bg-blue-200 hover:bg-blue-300 rounded-lg transition-colors" style="color:oklch(0.606 0.25 292.717)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        {eventOutline ? '更新大纲' : '增加大纲'}
                    </a>
                </div>
            </div>
            
            <div class="right-editor">
                {#if isOutline}
                    <div class="flex items-center mb-4">
                        <h3 class="font-medium">编写大纲内容</h3>
                            <!-- svelte-ignore a11y_invalid_attribute -->
                        <a 
                            href="#" 
                            on:click|preventDefault={outlineexample} 
                            class="outline-example-link"
                        >
                            查看样例
                        </a>
                    </div>
                {:else}
                    <div class="flex items-center gap-2 mb-4">
                        <label for="title-input" class="font-medium">标题:</label>
                        <input 
                            type="text" 
                            bind:value={chapterTitle} 
                            id="title-input" 
                            placeholder="请输入标题" 
                            class="rounded-md mt-1 block w-4/5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                    </div>
                {/if}
                
                <div class="editor-content">
                    <SimpleMDE bind:content={content} bind:contentset={contentset}/>
                </div>
                
                <div class="mb-4">
                    <label for="mdfile-input" class="block text-sm font-medium mb-1">
                        Markdown文件名:
                    </label>
                    <input 
                        type="text" 
                        bind:value={mdfilename} 
                        id="mdfile-input" 
                        placeholder="制作大纲需要md文件名:readme.md" 
                        class="rounded-md mt-1 block w-4/5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                </div>

                <div class="button-group">
                    <button 
                        class="button button-danger" 
                        on:click={() => closeWritebook(0)}
                    >
                        不保存退出
                    </button>
                    <button 
                        class="button button-primary" 
                        on:click={submitChapter}
                        disabled={isLoading}
                    >
                        {isLoading ? '处理中...' : '提交'}
                    </button>
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