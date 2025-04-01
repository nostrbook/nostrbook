 
  <script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

    let bookid = 0;
    let title;

    $: if (page){
        let pathname = $page.url.pathname;
        title = $page.url.searchParams.get('title')||"nostrBOOK";
        bookid = pathname.split("/books/")[1]
    }


  onMount(async () => {
    // 动态加载 CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/static/css/vue.css';
    document.head.appendChild(css);

    // 动态加载 JS
    const js = document.createElement('script');
    js.src = '/static/js/docsify.min.js';
    document.body.appendChild(js);

    const styleElements = document.getElementsByTagName('style');
    let targetStyleElement = null;
    for (let i = 0; i < styleElements.length; i++) {
        const element = styleElements[i];
        const dataViteDevId = element.getAttribute('data-vite-dev-id');
        if (dataViteDevId && dataViteDevId.includes('app.css')) {            
            element.parentNode.removeChild(element);
            break;
        }
    }
 

    window.$docsify = {
      name: title,
      loadSidebar: true,
      homepage: "readme.md",
      subMaxLevel:2,
      alias: {
          '/_sidebar.md': './_sidebar.md',
      }
    };


  });

  </script>

  <div id="app">Loading Docsify...</div>