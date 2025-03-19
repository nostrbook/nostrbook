<script lang="ts">
 
    import '../app.css';
 

    import SideMenu from '../lib/SideMenu.svelte';

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
        overflow-y: auto;
    }
</style>

<div class="container mx-auto max-w-7xl flex h-screen">
    <div class="side-menu">
        <SideMenu />
    </div>
    <div class="content">
        <slot />
    </div>
</div>    