<script>
    import { onMount } from 'svelte';

    let bookTitle = '';
    let author = '';
    let coverImage = null;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                coverImage = e.target.result;
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
                        reader.onload = (e) => {
                            // 将图片数据保存到变量中
                            coverImage = e.target.result;
                             

                        };
                        reader.readAsDataURL(blob);
                        break; // 找到图片后退出循环
                    }
                }
            }
        }
    };
    const handleSubmit = () => {
        // 这里可以添加提交表单的逻辑，例如发送数据到服务器
        console.log('书名:', bookTitle);
        console.log('作者:', author);
        
    };

    onMount(() => {
        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    });
</script>

<style>
    input:focus {
	    border: 1px solid #d4237a; /*  */
    }
</style>

<div class="p-8 max-w-md mx-auto">
    <p class="text-2xl font-bold text-center text-gray-800 mb-4">创建一本新书</p>
    {#if coverImage}
        <div class="mb-4">
            <img src={coverImage} alt="封面图片预览" class=" rounded-md" style="width: 100%; aspect-ratio: 260 / 300; border-radius: 0.375rem;" />
        </div>
    {:else}
        <div class="mb-4 border border-gray-300 rounded-md  flex justify-center items-center text-gray-400" style="width: 100%; aspect-ratio: 260 / 300; border-radius: 0.375rem;">
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