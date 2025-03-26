<script lang="ts">
    import { nip19 } from 'nostr-tools';
    import  NDK, { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
    import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'

    import { onMount } from 'svelte';
    import  Modal  from '$lib/Modal.svelte';
    import {WebStorage} from '$lib/WebStorage'

    import { getContext } from 'svelte';
     
    // 页面左右结构共享变量
    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
   

    let Keypriv;
    let Keypub;
    let nsecValue = '';
    let npubValue = '';
    let newkeyPriv;
    let displayText = '登录';
    

    // 图标配置（使用Heroicons）
    const icons = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
    create: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>`,
    about: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`
    };

    // 菜单配置
    const menuItems = [
    { 
        text: '首页', 
        link: '/', 
        requiresLogin: false,
        icon: icons.home // 直接引用图标
    },
    { 
        text: '开启创作', 
        link: '/createbook', 
        requiresLogin: true,
        icon: icons.create
    },
    { 
        text: '关于', 
        link: '/about', 
        requiresLogin: false,
        icon: icons.about
    }
    ];



    // 定义一个响应式变量来控制菜单的显示与隐藏
    let isMenuOpen = false;

    // 点击登录链接时切换菜单的显示状态
    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
    };

  
    onMount(() => {
        
        let storage = new WebStorage(localStorage);
        let keyPrivhex = storage.get("keyPriv");
         
        if (keyPrivhex != null){

            const numArray = keyPrivhex.split(',').map(Number);
            Keypriv = new Uint8Array(numArray)
            Keypub = getPublicKey(Keypriv) // `pk` is a hex string
            nsecValue = nip19.nsecEncode(Keypriv);
            npubValue = nip19.npubEncode(Keypub);
            displayText = npubValue.toString().slice(0, 8) + ":" +  npubValue.toString().slice(-6);
            
            keyprivStore.set( Keypriv);
            keypubStore.set(Keypub);
        }


    

 
    });


    let showModal = 0;
    
    const handleMenuItemClick = (event, item) => {
        if (item.requiresLogin) {
             
            if (!Keypriv) {
                event.preventDefault(); // 阻止默认的跳转行为
                showModal = 4; //show提示登录信息 
            }
        }
    };


    const openModal = (param) => {
        showModal = param;
          
    };

    const closeModal = (param) => {
       showModal = 0;
          
    };




    const confirmAction = () => {
        try {
            // 使用 nostr-tools 验证 nsec
            const { type, data } = nip19.decode(nsecValue);
            if (type === 'nsec') {
                return 0
            } else {
                nsecValue = '输入的不是有效的 nsec';
                return 1;
            }
        } catch (error) {
            nsecValue = '输入的 nsec 无效';
            return 1;
        }
    }
    const LoginOk = () => {
        
        
        Keypriv = nip19.decode(nsecValue)['data']
        
        Keypub = getPublicKey(Keypriv)
        npubValue = nip19.npubEncode(Keypub);
        let storage = new WebStorage(localStorage);
        storage.set("keyPriv",Keypriv);
        if (confirmAction() == 0)
            showModal = 0;

        displayText = npubValue.toString().slice(0, 8) + ":" +  npubValue.toString().slice(-6);
    };

    const LogoutOk = () => {
        Keypriv   = '';
        Keypub    = '';
        nsecValue = '';
        npubValue = '';
     
        displayText = '登录';
        let storage = new WebStorage(localStorage);
        storage.remove("keyPriv");
        showModal = 0;
 
    };

    const RegisterOk = () => {
        if (newkeyPriv == "" )
        {
            nsecValue = '未生成 nsec，可以点击关闭 退出。';
            return ;
        }
        let storage = new WebStorage(localStorage);
        storage.set("keyPriv",newkeyPriv)
        Keypriv =  newkeyPriv; 
        Keypub = getPublicKey(Keypriv) // `pk` is a hex string
        nsecValue = nip19.nsecEncode(Keypriv);
        npubValue = nip19.npubEncode(Keypub);

        keyprivStore.set(Keypriv);
        keypubStore.set(Keypub);
        displayText = npubValue.toString().slice(0, 8) + ":" +  npubValue.toString().slice(-6);

        if (confirmAction() == 0)
            showModal = 0;
    };

    const handleNewPrivKey = () =>{
        
        newkeyPriv = generateSecretKey();
        let bech32PrivateKey = nip19.nsecEncode(newkeyPriv)
        nsecValue = bech32PrivateKey;
        
       

    }

    function handleLinkClick() {
        // 使用 window.location.href 进行跳转并强制刷新页面
        window.location.href = '/writebook';
        
    }

    let loginRef;

    // 点击菜单外部关闭
    function handleClickOutside(event) {
         
        if (!loginRef.contains(event.target)) {
            isMenuOpen = false;
        }
    }

    // 添加全局点击监听
    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
        document.removeEventListener('click', handleClickOutside);
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
        border: 1px solid #d4237a; /* 鼠标悬停时的文字颜色 */

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
            
            color: #d4237a; /* 鼠标悬停时的文字颜色 */
        }    

    input:focus {
	    border: 1px solid #d4237a; /*  */
    }

    .modal-text-background {
        background-color: #f3f4f6; /* 浅灰色背景，可按需调整 */
        padding: 1rem;
        border-radius: 0.375rem;
        margin-bottom: 1rem;
    }

    /* 普通提示文字样式 */
   .modal-text {
        font-size: 1rem;
        color: #333;
        line-height: 1.5;
        text-align: center;
    }

    /* 警告提示文字样式 */
   .modal-text-warning {
        color: #e53e3e;
        font-weight: 600;
    }
    .menu-icon {
        
        stroke: currentColor; /* 继承文字颜色 */
    }

</style>

<nav>
    <ul class="menu bg-base-200 rounded-box w-full p-2">
    {#each menuItems as item}
        <li>

        <a
        data-sveltekit-preload-data="tap"
        href={item.link}
        
        class="flex items-center gap-3 px-4 py-3 text-base"  style="color:oklch(0.45 0.033 256.848)"
        >
        <span class="relative top-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
            {@html item.icon}
        </span>
        <span class="relative text-lg leading-none">{item.text}</span> <!-- 调大字体并清除行高影响 -->
        </a>
        </li>
    {/each}
    </ul>  
     

</nav>    
    <!-- svelte-ignore a11y_invalid_attribute -->
 
    <a
        data-sveltekit-preload-data="tap"
        href=""
        on:click|preventDefault={toggleMenu}
        class="flex items-center gap-3 px-4 py-3 text-base absolute bottom-4"  style="color:oklch(0.45 0.033 256.848)"
        bind:this={loginRef} >
        <span class="relative top-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
            {@html icons.user }
        </span>
        <span class="relative text-lg leading-none">{displayText}</span> <!-- 调大字体并清除行高影响 -->
    </a>
         

    <!-- 登录菜单 -->
    <div class={`login-menu ${isMenuOpen ? 'open' : ''}`}  >
        <ul>
            <!-- svelte-ignore a11y_invalid_attribute -->
            <a href=""  on:click={() => openModal(1)} >
             <li >
            {#if npubValue === ''}
               Login
               {:else}
               切换用户 
             {/if}
              </li> 
            </a>
             
            {#if npubValue === ''} 
              <!-- svelte-ignore a11y_invalid_attribute -->
              <a href=""  on:click={() => openModal(2)} ><li>Register</li></a>
            {:else}
              <!-- svelte-ignore a11y_invalid_attribute -->
              <a href=""  on:click={handleLinkClick} ><li>我的书籍</li></a>
              <!-- svelte-ignore a11y_invalid_attribute -->
              <a href=""  on:click={() => openModal(3)} ><li>Logout</li></a>
            {/if} 
        </ul>
    </div>
     

<Modal isOpen={showModal==1} onClose={() => closeModal(1)}  onOK={LoginOk}>
    <svelte:fragment slot="title">
        <h2 class="text-2xl font-bold">Login</h2>
    </svelte:fragment>
    <div class="flex justify-center space-y-10">
        <div class="self-start w-full md:w-3/4 lg:w-1/2">
           <div class="modal-text-background">
            <p>粘贴已有的nsec...登录</p>
           </div> 
            <input 
                type="text" 
                placeholder="请输入nsec" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style="user-select: auto;"
             bind:value={nsecValue} />
             
        </div>
    </div>
 
</Modal>


<Modal isOpen={showModal == 2 } onClose={() => closeModal(2)} onOK={RegisterOk}>
    <svelte:fragment slot="title">
        <h2 class="text-2xl font-bold">Register</h2>
    </svelte:fragment>
    <div class="flex justify-center space-y-10">
        <div class="self-start w-full md:w-3/4 lg:w-1/2">
            <div class="modal-text-background">
            <p class="modal-text">点击生成一个密钥</p>
            </div>
            <div class="flex w-full max-w-md space-x-2">
            <input 
                type="text"                  
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex-1  px-4 py-2"
                style="user-select: auto;" 
             bind:value={nsecValue} />
                
            <button
                 class="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-1 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                style="margin-left:3px;border-radius: 6px; " aria-label="生成一个用户密钥" on:click={handleNewPrivKey}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
            </div>
             
        </div>
    </div>
 
</Modal>


<Modal isOpen={showModal==3} onClose={() => closeModal(3)}  onOK={LogoutOk}>
    <svelte:fragment slot="title">
        <h2 class="text-2xl font-bold">Logout</h2>
    </svelte:fragment>
    <div class="flex justify-center space-y-10">
        <div class="self-start w-full md:w-3/4 lg:w-1/2">
            <div class="modal-text-background">
                        <p class="modal-text">注销前请保存你的nsec</p>
                        <p class="modal-text modal-text-warning">丢失将无法找回!</p>
            </div>
          
            <input 
                type="text" 
                placeholder="" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style="user-select: auto;"
             bind:value={nsecValue} />
             
        </div>
    </div>
 
</Modal>


<Modal isOpen={showModal==4} onClose={() => closeModal(4)}  onOK={() => closeModal(4)}>
    <svelte:fragment slot="title">
        <h2 class="text-2xl font-bold">提示！</h2>
    </svelte:fragment>
    <div class="flex justify-center space-y-10">
        <div class="self-start w-full md:w-3/4 lg:w-1/2">
            <p class="mt-10">请先登录</p>
        </div>
    </div>
 
</Modal>