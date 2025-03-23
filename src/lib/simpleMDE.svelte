<script>
    import { onMount } from 'svelte';

    let simplemde;
    export let content;
    let textareaRef; // 用于存储 textarea 元素的引用

    onMount(async () => {
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
                            // 这里可以添加上传图片到服务器的逻辑，获取图片 URL
                            // 为了简单示例，我们假设已经有了图片 URL
                            const imageUrl = URL.createObjectURL(file);
                            const cm = editor.codemirror;
                            const cursor = cm.getCursor();
                            const imageMarkdown = `![图片](${imageUrl})`;
                            cm.replaceRange(imageMarkdown, cursor);
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
                toolbar:[
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
            style.textContent = `.CodeMirror { height: 90%; }`;
            document.head.appendChild(style);

        } catch (error) {
            console.error('加载 SimpleMDE 时出错:', error);
        }
    });

    // 将响应式声明移到顶级作用域
    $: if (simplemde) {
        simplemde.value(content);
    }
</script>

<textarea bind:value={content} bind:this={textareaRef}></textarea>