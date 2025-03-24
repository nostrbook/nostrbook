<script>
    import { onMount } from 'svelte';
    import { uploadFile } from '$lib/nip96';
    import { defaultUploaderURLs, defaultRelays } from '$lib/config';
    import { getContext } from 'svelte';
    import { writable, get } from 'svelte/store';

    const keyprivStore = getContext('keypriv');
    const keypubStore = getContext('keypub');
    let Keypriv;
    let Keypub;

    let simplemde;
    export let content;
    let textareaRef; // 用于存储 textarea 元素的引用
    let isupload = false;
    let loadMessage = "正在上传图片";

    function get_url(tags, tagName) {
        const urlEntry = tags.find(item => item[0] === tagName);
        return urlEntry[1];
    }

    const handlePaste = async (event) => {
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
                    isupload = true;
                    loadMessage = "正在上传图片";

                    let url = defaultUploaderURLs[0];
                    let response = await uploadFile(url, blob, Keypriv);
                    let coverurl = get_url(response.nip94_event.tags, "url");
                    console.log(coverurl);
                    isupload = false;

                    if (simplemde) {
                        const cm = simplemde.codemirror;
                        const cursor = cm.getCursor();
                        const imageMarkdown = `![图片](${coverurl})\n`; // 添加换行符
                        cm.replaceRange(imageMarkdown, cursor); // 插入图片 Markdown 语法
                        cm.setCursor(cursor.line + 1, 0); // 将光标移动到下一行
                    }
                    

                    break; // 处理完一张图片后退出循环
                }
            }
        }
    };


    onMount(() => {
        document.removeEventListener('paste', handlePaste);
        document.addEventListener('paste', handlePaste);

        // 返回一个销毁函数，在组件销毁时移除监听器
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    });

    onMount(async () => {
        // 确保事件监听器只绑定一次
 

        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);

        try {
            // 动态导入 SimpleMDE 模块
            const { default: SimpleMDE } = await import('simplemde');
            // 动态导入 SimpleMDE 的 CSS 文件
            await import('simplemde/dist/simplemde.min.css');
            const { marked } = await import('marked');

            const insertImageButton = {
                name: 'insertImage',
                action: function (editor) {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.addEventListener('change', async (event) => {
                        const file = event.target.files[0];
                        if (file) {
                            const imageUrl = URL.createObjectURL(file);
                            const cm = editor.codemirror;
                            const cursor = cm.getCursor();
                            const imageMarkdown = `![图片](${imageUrl})\n`;
                            cm.replaceRange(imageMarkdown, cursor);
                            cm.setCursor(cursor.line + 1, 0);
                        }
                    });
                    input.click();
                },
                className: 'fa fa-camera',
                title: '上传图片'
            };

            simplemde = new SimpleMDE({
                element: textareaRef, // 使用绑定的 textarea 引用
                autofocus: true,
                spellChecker: false,
                previewRender: function (plainText) {
                    return marked(plainText); // 使用导入的 marked 实例
                },
                toolbar: [
                    'bold', 'italic', 'heading-1', 'heading-2', 'heading-3',
                    'quote', 'unordered-list', 'ordered-list', 'link', 'image', 'code', 'table', 'horizontal-rule',
                    'preview', 'side-by-side', 'fullscreen', 'guide',
                    insertImageButton, '|',
                ]
            });

            // 设置初始内容
            if (content) {
                simplemde.value(content);
            }

            // 监听 SimpleMDE 内容变化并更新 content 变量
            simplemde.codemirror.on('change', () => {
                content = simplemde.value();
            });

            const style = document.createElement('style');
            style.textContent = `.CodeMirror { height: 85%; }`;
            document.head.appendChild(style);

        } catch (error) {
            console.error('加载 SimpleMDE 时出错:', error);
        }

        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    });

    // 将响应式声明移到顶级作用域
    $: if (simplemde) {
        simplemde.value(content);
    }
</script>

<textarea bind:value={content} bind:this={textareaRef}></textarea>

{#if isupload}
    <div class="info-modal">
        <div class="info-content">
            <div class="flex items-center">
                <div class="loading-spinner mr-3"></div>
                <span>{loadMessage}</span>
            </div>
        </div>
    </div>
{/if}