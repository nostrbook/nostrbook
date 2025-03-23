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

            simplemde = new SimpleMDE({
                element: textareaRef, // 使用绑定的 textarea 引用
                autofocus: true,
                spellChecker: false,
                previewRender: function (plainText) {
                    return marked(plainText); // 使用导入的 marked 实例
                }
            });

            // 设置初始内容
            if (content) {
                simplemde.value(content);
            }

            // 监听 SimpleMDE 内容变化并更新 content 变量
            simplemde.codemirror.on('change', () => {
                content = simplemde.value();
            });

            // 监听 content 变量变化并更新 SimpleMDE 内容
            $: if (simplemde) {
                simplemde.value(content);
            }

            const style = document.createElement('style');
            style.textContent = `.CodeMirror { height: 90%; }`;
            document.head.appendChild(style);

        } catch (error) {
            console.error('加载 SimpleMDE 时出错:', error);
        }
    });
</script>

<textarea bind:value={content} bind:this={textareaRef}></textarea>