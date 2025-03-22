<script lang="ts">
    import { onMount } from 'svelte';
    import type { EventTemplate } from 'nostr-tools/pure';
    import  { finalizeEvent } from 'nostr-tools/pure';
    import {
     type FileUploadResponse,
     type OptionalFormDataFields,
    } from 'nostr-tools/nip96';
 
    import { uploadFile } from '$lib/nip96';
    import { defaultUploaderURLs,defaultRelays} from '$lib/config';
    import {createbook} from '$lib/bookevent';

    import {
        getEventHash,
        type Event,
        nip19,
        getPublicKey,
        generateSecretKey,
        nip04
    } from 'nostr-tools';

    import { getContext } from 'svelte';
    import { writable, get } from 'svelte/store';
     

    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv;
    let Keypub;

    let isPublishing = false;
    let publishMessage = '正在发布...';


    let bookTitle = '';
    let author = '';
    let coverImage = null;

    const resizeImage = (imageSrc, maxWidth, maxHeight) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = width * (maxHeight / height);
                    height = maxHeight;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const resizedDataURL = canvas.toDataURL('image/jpeg');
                resolve(resizedDataURL);
            };
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                 const resizedImage = await resizeImage(e.target.result, 262*2, 369*2);
                 coverImage = resizedImage;

            };
            reader.readAsDataURL(file);
        }
    };

    const handlePaste = (event) => {
        // 获取剪贴板数据
        const clipboardData = event.clipboardData;

        if (clipboardData) {
            // 遍历剪贴板中的每一项
            for (let i = 0; i < clipboardData.items.length; i++) {
                 
                const item = clipboardData.items[i];

                // 检查是否是图片类型
                if (item.type.indexOf('image') !== -1) {
                    // 获取图片的 Blob 对象
                    const blob = item.getAsFile();

                    if (blob) {
                        // 使用 FileReader 读取图片数据
                        const reader = new FileReader();
                        reader.onload = async(e) => {
                             const resizedImage = await resizeImage(e.target.result, 262*2, 369*2);
                             coverImage = resizedImage;
                             

                        };
                        reader.readAsDataURL(blob);
                        break; // 找到图片后退出循环
                    }
                }
            }
        }
    };

        // 将 DataURL 转换为 File 对象的函数
    function dataURLToFile(dataURL, fileName) {
        // 提取 DataURL 中的 MIME 类型
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        // 对 Base64 编码的数据进行解码
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        // 创建 Blob 对象
        const blob = new Blob([u8arr], { type: mime });
        // 从 Blob 对象创建 File 对象
        return new File([blob], fileName, { type: mime });
    }

    function get_url(tags,tagName){
        const urlEntry = tags.find(item => item[0] === tagName);
        return urlEntry[1];
    }
    const handleSubmit = async () => {
        isPublishing = true;

        // 这里可以添加提交表单的逻辑，例如发送数据到服务器
        // upload coverImage to media server 
        let url = defaultUploaderURLs[0];
        let file = dataURLToFile(coverImage,"coverImage.png");
        let response = await uploadFile(url,file,Keypriv); 
        let coverurl = get_url(response.nip94_event.tags,"url");
        publishMessage = "图片上传成功，正在发布信息";
       
        const bookInfo = {
            coverurl: coverurl,
            title: bookTitle,
            author: author
        };

        
        setTimeout( async () => {
            let ret = await createbook(defaultRelays,bookInfo,Keypriv);         
            publishMessage = "发布成功到 " + ret.size + "个服务器。" ;
            setTimeout(() => {
                isPublishing = false;
            }, 3000);
        },100);
    };




    onMount(() => {
        document.addEventListener('paste', handlePaste);
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);
         
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    });



</script>

<style>
    input:focus {
	    border: 1px solid #d4237a; /*  */
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
    }

    .info-content {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.375rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
</style>

<div class="p-8 max-w-md mx-auto">
    <p class="text-2xl font-bold text-center text-gray-800 mb-4">创建一本新书</p>
    {#if coverImage}
        <div class="mb-4">
            <img src={coverImage} alt="封面图片预览" class="rounded-md" style="width: 100%; aspect-ratio: 260 / 300; border-radius: 0.375rem;" />
        </div>
    {:else}
        <div class="mb-4 border border-gray-300 rounded-md flex justify-center items-center text-gray-400" style="width: 100%; aspect-ratio: 260 / 300; border-radius: 0.375rem;">
            封面图片
        </div>
    {/if}

    <div class="mb-4">
      <div class="mt-1">
                <input
                    type="file"
                    id="coverImage"
                    accept="image/*"
                    on:change={handleFileChange}
                    class="hidden"
                />
                <label for="coverImage" class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    上传封面图片 + 
                </label>
        </div>
            <p class="text-sm text-gray-500 mt-1">或者直接粘贴截图</p>
         
    </div>

    <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-4">
            <label for="bookTitle" class="block text-sm font-medium text-gray-700">书名</label>
            <input
                type="text"
                id="bookTitle"
                bind:value={bookTitle}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请输入书名"
            />
        </div>
        <div class="mb-4">
            <label for="author" class="block text-sm font-medium text-gray-700">作者</label>
            <input
                type="text"
                id="author"
                bind:value={author}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请输入作者"
            />
        </div>

        <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            提交
        </button>
    </form>
</div>

{#if isPublishing}
    <div class="info-modal">
        <div class="info-content">
            <div class="flex items-center">
                {#if publishMessage === '正在发布...'}
                    <div class="loading-spinner mr-3"></div>
                {/if}
                <span>{publishMessage}</span>
            </div>
        </div>
    </div>
{/if} 