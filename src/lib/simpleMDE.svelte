<script>
    import { onMount } from 'svelte';
  

    let textarea;
    let simplemde;
 
    onMount(async () => {
        try {
            // 动态导入 SimpleMDE 模块
            const { default: SimpleMDE } = await import('simplemde');
            // 动态导入 SimpleMDE 的 CSS 文件
            await import('simplemde/dist/simplemde.min.css');
            const { marked } = await import('marked');
   


            simplemde = new SimpleMDE({
                element: textarea,
                autofocus: true,
                spellChecker: false,
                previewRender: function (plainText) {
                    return marked(plainText);
                }
            });
            const style = document.createElement('style');
            style.textContent = `.CodeMirror { height: 90%; }`;
            document.head.appendChild(style);

 
        } catch (error) {
            console.error('加载 SimpleMDE 时出错:', error);
        }
    });
</script>
<style>
.CodeMirror {
    height: 75%;
}
</style>

<textarea bind:this={textarea}></textarea>    