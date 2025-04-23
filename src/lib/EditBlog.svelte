<script lang="ts">
     
    import { bloglist,createblog,updateblog } from '$lib/bookevent';
    import { getContext } from'svelte';
    import { writable, get } from'svelte/store';
    import { page } from '$app/stores';
    import { onMount } from'svelte';
    import SimpleMDE from '$lib/simpleMDE.svelte';
    import { uploadFile } from '$lib/nip96';
    import { defaultUploaderURLs,defaultRelays} from '$lib/config';
    import {saveDraft,getDraft} from '$lib/WebStorage';

    // 状态管理
    let isLoading = false;
    let saved = true;
    export let isWriteblogOpen: boolean;
    export let dataToEdit;
    export let method;


    let content: string = "";
    let simplemde;
    let updatecontent; //修改的时候内容 赋值这样可以让编辑框显示 修改的内容;
    let Title: string = "";
    let blogTitle: string = ""; // 明确博客标题变量
     
    let blogId: string = ""; // 明确博客 ID 变量
   
    let dMessage = ""; // 加载提示信息
    let coverImage: File | null = null; // 新增：封面图片文件
    let coverImagePreview: string | null = null; // 新增：封面图片预览 URL

    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv: string;
    let Keypub: string;

    let currentBlogDraftId;


    // 工具函数
    function getTag(tags: string[][], tagName: string): string {
        const tagEntry = tags.find(item => item[0] === tagName);
        return tagEntry? tagEntry[1] : "";
    }

    function setLoading(state: boolean): void {
        if (state) dMessage = "正在加载";
        isLoading = state;
    }



    // 关闭博客编辑器
    const closeWriteblog = (ischeck: number): void => {
        
        currentBlogDraftId = null;

        if (ischeck === 0) {
            isWriteblogOpen = false;
            window.location.reload();
            return;
        }
        window.location.reload();
        isWriteblogOpen = false;
    };
 

    function saveDraftSubmit() {
        if (blogTitle === "") {
            alert("标题不能为空，请输入标题后再保存草稿。");
            return;
        }

        const contentToSave = simplemde.value();
        if (contentToSave === "") {
            alert("内容不能为空，请输入内容后再保存草稿。");
            return;
        }
 
        const draft = {
            blogTitle,
            content: simplemde.value(),
            coverImagePreview: coverImagePreview? coverImagePreview: null // 保存封面图片文件名
        };
 
        if (!currentBlogDraftId) {
            currentBlogDraftId = Math.floor(Date.now() / 1000);
        }

        // 使用当前的草稿 ID 进行保存，实现覆盖逻辑
        saveDraft("blog", currentBlogDraftId, draft);

        saved = true;
        alert("草稿已保存");
         
    }

    function loadDraftSubmit(blogid) {
        let draft = getDraft("blog", blogid);
        if (draft) {
            const { blogTitle: draftTitle, content: draftContent, coverImagePreview: draftCoverImage } = JSON.parse(draft);
            // 假设 blogTitle 是一个可以直接赋值的变量
            blogTitle = draftTitle;
            // 去掉未定义的 mdfilename 和 draftFilename 相关代码
            content = draftContent;
            simplemde.value(content);
            currentBlogDraftId  = blogid;
        } 
    }

    function get_url(tags,tagName){
        const urlEntry = tags.find(item => item[0] === tagName);
        return urlEntry[1];
    }

    async function uploadCoverImage(file){
            let url = defaultUploaderURLs[0];             
            let response = await uploadFile(url,file,Keypriv); 
            let coverurl = get_url(response.nip94_event.tags,"url");
            dMessage = "封面上传成功 ";
            setTimeout(() => {
                isLoading = false; 
            }, 1000);
            return coverurl;
    }
    
    // 统一处理图片上传和预览
    async function processImageFile(file: File) {
        isLoading = true;
        dMessage = "正在上传封面";
        // 1. 显示预览
        const previewUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
        coverImagePreview = previewUrl;
        
        // 2. 上传图片
        try {
            const uploadedUrl = await uploadCoverImage(file);
            console.log("图片已上传至:", uploadedUrl);
            
            coverImagePreview = uploadedUrl;
            return uploadedUrl;

        } catch (error) {
            // 上传失败时保留预览但标记上传失败
            coverImagePreview = previewUrl; // 保留预览
            throw error;
        }
    }

    // 处理文件选择上传
    async function handleCoverImageChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            await processImageFile(file);
        }
    }

    // 处理粘贴上传
    async function handlePaste(event: ClipboardEvent) {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault(); // 阻止默认粘贴行为
                const blob = item.getAsFile();
                if (blob) {
                    await processImageFile(blob);
                }
                break; // 只处理第一个图片
            }
        }
    }

    // 响应式语句
    $: if (isWriteblogOpen) {
        saved = false;
         
        if (method == 2){ //draft
            blogTitle          = dataToEdit.blogTitle;
            content            = dataToEdit.content;
            coverImagePreview  = dataToEdit.coverImagePreview;
            currentBlogDraftId = dataToEdit.id 
            updatecontent = content;
        } else {
            currentBlogDraftId = null;
        }

        if  (method == 1){
            blogTitle = getTag(dataToEdit.tags,"title");
            content = dataToEdit.content;
            updatecontent = content;
             
            coverImagePreview =  getTag(dataToEdit.tags,"cover");
        }
      

    }

    $: if (blogTitle) { saved = false; }
    $: if (content) { saved = false; }
    $: if (simplemde) { content = simplemde.value(); }
    $: if (simplemde && updatecontent) {
        simplemde.value(updatecontent);
    }

    // 组件挂载
    onMount(() => {
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);
    });

    // 提交博客逻辑（简单示例，可根据实际需求完善）
    async function submitBlog() {
        setLoading(true);
        try {
            // 这里可以添加实际的提交逻辑，比如调用 API 保存博客
            console.log(coverImagePreview);
            console.log(blogTitle);
            content = simplemde.value();
            console.log(content);
            let ret ;
            if (method == 1){
                let dtag = getTag(dataToEdit.tags,"d");
                ret = await updateblog(defaultRelays,content,blogTitle,coverImagePreview,dtag,Keypriv);
            }else {
                ret = await createblog(defaultRelays,content,blogTitle,coverImagePreview,Keypriv);
            }
            saved = true;
            if (ret.size === 0) {
                dMessage = `发布失败，未成功发布到任何服务器,已经保存到草稿。`;
                //saveDraft();
            } else {
                dMessage = `成功发布到 ${ret.size} 个服务器。`;
            }

            setTimeout(() => {
               closeWriteblog(1);
            }, 3000);
            
        } catch (error) {
            alert('博客提交失败:', error);
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
</script>

<style>
    .writeblog-overlay {
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

    .writeblog-container {
        display: flex;
        width: min(90%, 1200px);
        height: min(90vh, 800px);
        background-color: white;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
    }

    .left-editor {
        width: 70%;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .right-cover {
        width: 30%;
        padding: 1rem;
        border-left: 1px solid #e9ecef;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
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
        to {
            transform: rotate(360deg);
        }
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

    .button-secondary {
        background-color: #6c757d;
        color: white;
        border: none;
    }

    .button-secondary:hover {
        background-color: #5a6268;
    }



    .title-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
    }
    .title-input:hover{
        border: 1px solid #d4237a;
    }
 

    .background-image-upload {
        margin-bottom: 1rem;
        border: 2px dashed #e9ecef;
        border-radius: 0.375rem;
        padding: 1rem;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.2s;
    }

    .background-image-upload:hover {
        border-color: #1971c2;
    }

    .background-image-preview {
        max-width: 100%;
        max-height: 150px;
        margin-top: 1rem;
        border-radius: 0.375rem;
        object-fit: contain;
         
    }

    .background-image-input {
        display: none;
    }

    .upload-icon {
        font-size: 2rem;
        color: #6c757d;
        margin-bottom: 0.5rem;
    }

    .upload-text {
        color: #6c757d;
        font-size: 0.875rem;
    }

</style>

{#if isWriteblogOpen}
    <div class="writeblog-overlay">
        <button class="close-button" on:click={() => closeWriteblog(1)} aria-label="关闭编辑器">
            ×
        </button>
        <div class="writeblog-container">
            <div class="left-editor">
                <div class="mb-4">
                    <label for="title-input" class="font-medium">标题:</label>
                    <input
                        type="text"
                        bind:value={blogTitle}
                        id="title-input"
                        placeholder="请输入标题"
                        class="title-input focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                </div>
                

                
                <div class="editor-content">
                    <SimpleMDE bind:simplemde={simplemde} />
                </div>
                <div class="button-group">
                    <button
                        class="button button-danger"
                        on:click={() => closeWriteblog(0)}
                    >
                        不保存退出
                    </button>
                    <button
                        class="button button-secondary"
                        on:click={saveDraftSubmit}
                        disabled={isLoading}
                    >
                        保存草稿
                    </button>
                    <button
                        class="button button-primary"
                        on:click={submitBlog}
                        disabled={isLoading}
                    >
                        提交
                    </button>
                </div>
            </div>
            <div class="right-cover">
                <h3 class="font-medium mb-2">封面图片</h3>
                 <!-- 新增的背景图片上传区域 -->
                <div class="background-image-upload" on:click={() => document.getElementById('background-image-input').click()}
                on:paste={handlePaste}
                on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { 
                }
                }}
                role="button"  tabindex="0" >
                    {#if coverImagePreview}
                        <!-- 已上传图片时显示预览 -->
                        <img src={coverImagePreview} 
                            class="background-image-preview" 
                            alt="背景图片预览"
                         >
                    {:else}
                        <!-- 未上传图片时显示上传区域 -->
                        <div class="upload-area">
                            <div class="upload-icon">+</div>
                            <div class="upload-text">点击上传背景图片，或者粘贴截图</div>
                            <input 
                                type="file" 
                                id="background-image-input" 
                                class="background-image-input" 
                                accept="image/*"
                                on:change={handleCoverImageChange}
                            >
                        </div>
                    {/if}
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