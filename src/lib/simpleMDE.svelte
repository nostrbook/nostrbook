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

    export let simplemde;
    let content;
    
    
 

    let textareaRef;
    let isupload = false;
    let loadMessage = "正在上传图片";

    function get_url(tags, tagName) {
        const urlEntry = tags.find(item => item[0] === tagName);
        return urlEntry[1];
    }

    const handlePaste = async (event) => {
        const clipboardData = event.clipboardData;

        if (clipboardData) {
            for (let i = 0; i < clipboardData.items.length; i++) {
                const item = clipboardData.items[i];

                if (item.type.indexOf('image') !== -1) {
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
                        const imageMarkdown = `![图片](${coverurl})\n`;
                        cm.replaceRange(imageMarkdown, cursor);
                        cm.setCursor(cursor.line + 1, 0);
                    }

                    break;
                }
            }
        }
    };

    onMount(() => {
        document.removeEventListener('paste', handlePaste);
        document.addEventListener('paste', handlePaste);

        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    });

    onMount(async () => {
        Keypriv = get(keyprivStore);
        Keypub = get(keypubStore);

        try {
            const { default: SimpleMDE } = await import('simplemde');
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
                element: textareaRef,
                autofocus: true,
                spellChecker: false,
                previewRender: function (plainText) {
                    return marked(plainText);
                },
                toolbar: [
                    'bold', 'italic', 'heading-1', 'heading-2', 'heading-3',
                    'quote', 'unordered-list', 'ordered-list', 'link', 'image', 'code', 'table', 'horizontal-rule',
                    'preview', 'side-by-side', 'fullscreen', 'guide',
                    insertImageButton, '|',
                ]
            });

 
            const style = document.createElement('style');
            style.textContent = `.CodeMirror { height: 85%; }`;
            document.head.appendChild(style);

        } catch (error) {
            console.error('加载 SimpleMDE 时出错:', error);
        }
    });

 
</script>

<style>
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
        z-index: 1001;
         
    }

    .info-content {
        background-color: white;
        padding: 1.5rem;
        border-radius: 0.375rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }



</style>

<textarea id="textareacontent" bind:this={textareaRef}></textarea>

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