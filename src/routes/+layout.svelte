

<script lang="ts">
 
    import '../app.css';
 
    import SideMenu from '../lib/SideMenu.svelte';
    import { setContext } from'svelte';
    import { writable } from'svelte/store';
    import { page } from '$app/stores';

    //页面的左右结构来共享变量 
    // 创建可写存储来存储 keypriv 和 keypub
    const keyprivStore = writable('');
    const keypubStore = writable('');

    // 设置上下文
    setContext('keypriv', keyprivStore);
    setContext('keypub', keypubStore);

    let layoutMode = 0;

    $: if (page){
        try {
            let pathname = $page.url.pathname;
        
            if (pathname.startsWith('/books') || pathname.startsWith("/blog/")){
                layoutMode = 1;
            } else {
                layoutMode = 0;
            }
        } catch {
             
        }

    }


</script>

<style>
   .container {
        display: flex;
        height: 100vh;
        
    }

   .side-menu {
        position: relative;
        width: 20%;
        background-color: #f8f9fa; /* 浅灰色背景 */
        border-radius: 10px; /* 圆弧角 */
        margin: 10px;
        
        overflow: visible; /* 允许子元素超出 */
    }

   .content {
        width: 80%;
        padding: 20px;
         
    }
</style>

{#if layoutMode == 0}
<div class="container mx-auto max-w-7xl flex h-screen">
    <div class="side-menu">
        <SideMenu />
    </div>
    <div class="content">
      <slot />
    </div>
</div>    

{:else}
<slot />
{/if}