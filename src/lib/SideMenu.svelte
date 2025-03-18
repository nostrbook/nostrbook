<script lang="ts">
 

    const menuItems = [
        { text: '首页', link: '/' },
        { text: '关于', link: '/about' },
        
    ];

    import { onMount } from 'svelte';

    // 定义一个响应式变量来控制菜单的显示与隐藏
    let isMenuOpen = false;

    // 点击登录链接时切换菜单的显示状态
    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
    };

    // 点击页面其他地方关闭菜单
    const closeMenuOnClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const loginLink = document.querySelector('.fixed');
        const menu = document.querySelector('.login-menu');
        if (menu && loginLink) {
            if (!menu.contains(target) && !loginLink.contains(target)) {
                isMenuOpen = false;
            }
        }
    };

    onMount(() => {
        document.addEventListener('click', closeMenuOnClickOutside);
        return () => {
            document.removeEventListener('click', closeMenuOnClickOutside);
        };
    });

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
    a.fixed {
         
        position: absolute; /* 设置链接为绝对定位 */
        bottom: 4px; /* 离 nav 底部 4px */
        left: 0; /* 靠左对齐 */
        text-decoration: none;
        list-style: none;
        padding: 0;
        flex-flow: column;
        justify-content: left;
        gap: 0.5rem;
        width: 80%; /* 设置宽度为 80% */
        left: 50%; /* 将元素左边缘定位到父元素宽度的 50% 处 */
        transform: translateX(-50%); /* 将元素向左移动自身宽度的 50% */
    }


    .login-menu {
        display: none;
        position: absolute;
        bottom: 70px;
        left: 3%; /* 将菜单左边缘定位到 side-menu 的右边缘 */
        margin-left: 10px; /* 增加一些间距 */
        background-color: #eeeeee;
        border: 1px solid #e040fb;
        border-radius: 6px;
        padding: 10px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        width: 100%; /* 设置菜单宽度 */
    }

    .login-menu.open {
        display: block;
    }

       .login-menu ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

       .login-menu li {
            padding: 10px 15px; /* 增加左右内边距，让文字与边框有间距 */
            border-bottom: 1px dashed #ccc;
            cursor: pointer; /* 鼠标悬停时显示为手型 */
            transition: background-color 0.3s ease; /* 添加背景颜色过渡效果 */
            color: #333; /* 文字颜色 */
            font-size: 14px; /* 文字大小 */
        }

       .login-menu li:last-child {
            border-bottom: none;
        }

       .login-menu li:hover {
            background-color: #e0e0e0; /* 鼠标悬停时的背景颜色 */
            color: #000; /* 鼠标悬停时的文字颜色 */
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
    <!-- svelte-ignore a11y_invalid_attribute -->
    <a href="" class="fixed bottom-4" on:click|preventDefault={toggleMenu}>
        <li>
            <p>登录</p>
        </li>
    </a>
    <!-- 登录菜单 -->
    <div class={`login-menu ${isMenuOpen ? 'open' : ''}`}>
        <ul>
            <li>使用邮箱登录</li>
            <li>使用手机号登录</li>
        </ul>
    </div>
     
