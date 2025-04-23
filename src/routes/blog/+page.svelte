<script lang="ts">
    import { onMount } from 'svelte';
    import { defaultRelays } from '$lib/config';
    import { bloglist } from '$lib/bookevent';
    import { getContext } from 'svelte';
    import { writable, get } from 'svelte/store';
    import EditBlog from '$lib/EditBlog.svelte';
    import ViewBlog from '$lib/ViewBlog.svelte';
    import { getDraftsByCategory } from '$lib/WebStorage';


    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv;
    let Keypub;

    let blogs = [];
    let blogdrafts = [];
    let isLoading = false;
    let isWriteblogOpen = false;
    let isViewblogOpen = false;
    export let data;
    let activeButtonIndex = 3 ;
    let dataToEdit;
    let blogItem;

    function randthumbnail(img){
        if (!img)
            img = data.coverList;

        var length = img.length - 1;

        var rand = Math.floor(Math.random() * Math.floor(length));

        return img[rand]
    }

    console.log(randthumbnail());

    function get_tag(tags,tagName){
        const urlEntry = tags.find(item => item[0] === tagName);
        return urlEntry? urlEntry[1] : null; // 如果没找到则返回 null
    }

    function handlerBlog(e) {
        
        isLoading = false;
        

        //myblog 
        if (activeButtonIndex == 1){
            if (e.pubkey != Keypub)
                return ;
        } 
        e.title   = get_tag(e.tags, "title")
        let cover = get_tag(e.tags, "cover");
        e.cover   = cover ? cover : randthumbnail();
        blogs     = [...blogs, e];
        
    }

    function goblog(blog) {
        if (activeButtonIndex == 0 || activeButtonIndex == 3 ){
            window.location.href="/blog/"+blog.id
        } else {
          dataToEdit = blog;
          isWriteblogOpen = true;
           
        }
         
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

    bloglist(defaultRelays, handlerBlog);
    setTimeout(() => { isLoading = false; }, 5000);

    function handleImageError(event) {
        event.target.src = '/uploadfiles/?imgsrc=' + event.target.src;
    }

    onMount(() => {
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);

        return () => {
            // 清理逻辑
        };
    });



    function writeBlog() {
        // 这里可以添加写博客的逻辑，比如跳转到写博客页面
        isWriteblogOpen = true;
        activeButtonIndex = 0 ;
        dataToEdit = null;
    }


    function draftBlog(){
        activeButtonIndex = 2;
        blogs = [];
        blogdrafts  = getDraftsByCategory("blog");
         
    }

    function MyBlog(){
        
        if (!Keypub){
            alert("您未登录");
            return ;
        }
        activeButtonIndex = 1;

        isLoading = true;

        blogs = [];
 
        bloglist(defaultRelays, handlerBlog,Keypub);
    }

    function allBlog() {
        // 这里可以添加写博客的逻辑，比如跳转到写博客页面
        isLoading = true;
        activeButtonIndex = 3 ;
        blogs = [];
        bloglist(defaultRelays, handlerBlog);
    }

    function editblog(blog){
        dataToEdit = blog;
        isWriteblogOpen = true;

    }

</script>

<style lang="postcss">
    /* 全局样式 */
 

    /* 加载动画样式 */
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

    /* 模态框样式 */
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
        z-index: 1000;
    }

    .info-content {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    /* 横幅样式 */

    .bannerimg {
        border-radius: 0.5rem;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        max-width: 90%;
        height: auto;
    }

    /* 分隔线样式 */
    .separator {
        border: 0;
        border-top: 1px solid #e2e8f0;
        margin: 2rem 0;
    }

    /* 博客列表样式 */
    .blog-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }

    .blog-item {
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .blog-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .blog-cover {
        width: 150px;
        height: auto;
        object-fit: cover;
        margin-left: 2rem;
        margin-right: 1rem;
    }

    .blog-details {
        padding: 1.5rem;
        flex: 1;
    }

    .blog-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #333;
    }

    .blog-date {
        font-size: 0.9rem;
        color: #718096;
        margin-bottom: 1rem;
    }

    .blog-content {
        font-size: 1rem;
        color: #4b5563;
        margin-bottom: 1.5rem;
    }

    .read-more {
        color: #3182ce;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s ease;
    }

    .read-more:hover {
        color: #2c5282;
    }

 
     .bottom-bar {
        position: fixed;
        bottom: 1rem;
        left: 58%;
        transform: translateX(-58%);
        background-color: white;
        border: 1px solid #e2e8f0;
        padding: 0.2rem 0.2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 0.5rem;
        z-index: 100;
        transition: all 0.3s ease;
    }
 

    .bottom-bar-button {
        cursor: pointer;
        color: #d4237a;
        font-weight: 500;
        transition: color 0.3s ease;
        white-space: nowrap;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
    }

    .bottom-bar-button:hover {
        color: #2c5282;
        background-color: #f4f4f9;
    }

 
</style>

<div class="flex justify-center items-center ">
    <img src="/nostrblog.jpeg" alt="banner" class="bannerimg" style="height:100px;">
</div>

<hr class="separator">

<!-- 编辑草稿箱 -->
{#if activeButtonIndex == 2}
<div class="blog-grid">
    {#each blogdrafts as blog}
        <div class="blog-item">
            <div class="blog-details">
                <h2 class="blog-title">{blog.blogTitle}</h2>
                <p class="blog-date">{formatTimestamp(blog.id)}</p>
                <p class="blog-content">{blog.content.slice(0, 50)}...</p>
                 <!-- svelte-ignore a11y_invalid_attribute -->
                <a href="#" class="read-more" on:click|preventDefault={() => editblog(blog)}>编辑</a>
            </div>
            <img src={blog.coverImagePreview} alt={blog.blogTitle} class="blog-cover" on:error={handleImageError} />
        </div>
    {/each}
</div>
{:else}
<div class="blog-grid">
    {#each blogs as blog}
        <div class="blog-item">
            <div class="blog-details">
                <h2 class="blog-title">{blog.title}</h2>
                <p class="blog-date">{formatTimestamp(blog.created_at)}</p>
                <p class="blog-content">{blog.content.slice(0, 50)}...</p>
                 <!-- svelte-ignore a11y_invalid_attribute -->
                <a href="#" class="read-more" on:click|preventDefault={() => goblog(blog)}>{ activeButtonIndex == 1 ? '修改': '阅读更多'}</a>
            </div>
            <img src={blog.cover} alt={blog.title} class="blog-cover" on:error={handleImageError} />
        </div>
    {/each}
</div>
{/if}

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

<div class="flex items-center absolute bottom-4 bottom-bar">
    <button type="button" class="bottom-bar-button" on:click={allBlog} style="color: {activeButtonIndex === 3? '#d4237a' : '#4b5563'}">
        Blogs
    </button>
        | 
    <button type="button" class="bottom-bar-button" on:click={MyBlog} style="color: {activeButtonIndex === 1? '#d4237a' : '#4b5563'}">
        我的Blog
    </button>
       | 
    <button type="button" class="bottom-bar-button" on:click={writeBlog} style="color: {activeButtonIndex === 0? '#d4237a' : '#4b5563'}">
        撰写Blog
    </button>
        | 
    <button type="button" class="bottom-bar-button" on:click={draftBlog}  style="color: {activeButtonIndex === 2? '#d4237a' : '#4b5563'}">
        草稿箱
    </button>

     
</div>    

<EditBlog  bind:isWriteblogOpen={isWriteblogOpen} {dataToEdit} method={activeButtonIndex} /> 
