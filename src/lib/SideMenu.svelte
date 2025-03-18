<script lang="ts">
 

    const menuItems = [
        { text: '首页', link: '/' },
        { text: '关于', link: '/about' },
        
    ];
</script>

 <style>
    nav {
        margin-top: 1rem;
        margin-bottom: 1.5rem;
    }

    a {
        align-self: flex-start;
        text-decoration: none; /* 去除默认下划线 */
        display: block; /* 使 a 元素变为块级元素，方便设置背景 */
    }

    a:hover {
        text-decoration: none; /* 鼠标悬停时也无下划线 */
    }

    a > li {
        padding: 0.5rem 1rem; /* 保持原有的内边距 */
    }

    a > li:hover {
        background-color: #e8e8e8;
        border-radius: 20px; /* 设置圆角 */
    }

 

   ul {
        list-style: none;
        padding: 0;
        flex-flow: column;
        justify-content: left;
        gap: 0.5rem;
        width: 80%; /* 设置宽度为 80% */
        margin: 0 auto; /* 左右外边距自动，实现水平居中 */
    }

 
    li {
        display: flex;
        align-items: center;
        color: rgba(0, 0, 0, 0.7);
        padding: 0;
    }

    li p {
        margin-left: 0.5rem;
        font-size: 1.15rem;
        /* 进一步减小上下内边距 */
        padding: 0.1rem 0; 
        margin-bottom: 0;
    }
</style>

<nav>
    <ul >
        {#each menuItems as item}
        <a data-sveltekit-preload-data="tap" href="{item.link}">
            <li>
                <p>{item.text}</p>
            </li>
        </a>
        {/each}
    </ul>
</nav>    