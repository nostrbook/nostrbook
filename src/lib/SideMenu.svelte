<script lang="ts">
    import { nip19 } from 'nostr-tools';
    import  NDK, { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
    import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'

    import { onMount } from 'svelte';
    import  Modal  from '$lib/Modal.svelte';
    import {WebStorage} from '$lib/WebStorage'


   

    let Keypriv;
    let Keypub;
    let nsecValue = '';
    let newkeyPriv;
    let displayText = '登录';
    

    const menuItems = [
        { text: '首页', link: '/' },
        { text: '关于', link: '/about' },
        
    ];


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
        let storage = new WebStorage(localStorage);
        let keyPrivhex = storage.get("keyPriv");
         
        if (keyPrivhex != null){

            const numArray = keyPrivhex.split(',').map(Number);
            Keypriv = new Uint8Array(numArray)
            Keypub = getPublicKey(Keypriv) // `pk` is a hex string
            nsecValue = nip19.nsecEncode(Keypriv);
            displayText = nsecValue.toString().slice(0, 8) + ":" +  nsecValue.toString().slice(-6);
        }


        return () => {
            document.removeEventListener('click', closeMenuOnClickOutside);
        };

 
    });


    let showLoginModal = false;
    let showRegisterModal = false;

    const openModal = (param) => {
        if (param == 1){
             showLoginModal = true;
        }
        if (param == 2){
             showRegisterModal = true;
             newkeyPriv = "";
        }
         
         
    };

    const closeModal = (param) => {
        if (param == 1){
             showLoginModal = false;;
        }
        if (param == 2){
             showRegisterModal = false;;
        }
          
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
        
        console.log(nsecValue)
        if (confirmAction() == 0)
            showLoginModal = false;
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


        if (confirmAction() == 0)
            showRegisterModal = false;
    };

    const handleNewPrivKey = () =>{
        
        newkeyPriv = generateSecretKey();
        let bech32PrivateKey = nip19.nsecEncode(newkeyPriv)
        nsecValue = bech32PrivateKey;
         
       

    }
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
	    border: 1px solid #d4237a; /* 显示蓝色边框 */
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
            <p>{displayText}</p>
        </li>
    </a>
    <!-- 登录菜单 -->
    <div class={`login-menu ${isMenuOpen ? 'open' : ''}`}>
        <ul>
            <!-- svelte-ignore a11y_invalid_attribute -->
            <a href=""  on:click={() => openModal(1)} ><li >Login</li> </a>
             <!-- svelte-ignore a11y_invalid_attribute -->
            <a href=""  on:click={() => openModal(2)} ><li>Register</li></a>
        </ul>
    </div>
     

<Modal isOpen={showLoginModal} onClose={() => closeModal(1)}  onOK={LoginOk}>
    <svelte:fragment slot="title">
        <h2 class="text-2xl font-bold">Login</h2>
    </svelte:fragment>
    <div class="flex justify-center space-y-10">
        <div class="self-start w-full md:w-3/4 lg:w-1/2">
            <p>粘贴已有的nsec...登录</p>
            <input 
                type="text" 
                placeholder="请输入nsec" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style="user-select: auto;"
             bind:value={nsecValue} />
             
        </div>
    </div>
 
</Modal>


<Modal isOpen={showRegisterModal} onClose={() => closeModal(2)} onOK={RegisterOk}>
    <svelte:fragment slot="title">
        <h2 class="text-2xl font-bold">Register</h2>
    </svelte:fragment>
    <div class="flex justify-center space-y-10">
        <div class="self-start w-full md:w-3/4 lg:w-1/2">
            <p>点击生成一个密钥</p>
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