<script>
    import { onMount } from 'svelte';
    export let isOpen = false;
    export let onClose;
    export let onOK;

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleOK = () => {
        if (onOK) {
            onOK();
        }
    };

    onMount(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleEscKey);

        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    });
</script>

{#if isOpen}
<div class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50" style="background-color: rgba(47, 44, 46, 0.75); ">
    <div class="bg-white p-8 rounded shadow-lg w-2/5 min-h-96 border border-primary relative">
        <div class="pt-4 pb-2 px-4 border-b border-gray-200">
            <!-- 这里可以放置标题 -->
            <slot name="title" />
        </div>
        <div class="p-4">
            <!-- 这里放置主体内容 -->
            <slot />
        </div>
        <div class="absolute top-3 right-4">
            <button
                class="text-gray-500 hover:text-gray-700 focus:outline-none"
                on:click={handleClose} aria-label="关闭"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
        <div class="absolute space-x-4 px-4 pb-4 bottom-6 right-6">
            <button
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                on:click={handleClose}  
            >
                关闭
            </button>
            <button
                class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                on:click={handleOK}  
            >
                确定
            </button>
        </div>
    </div>
</div>
{/if}    
 