 
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


  onMount(() => {
    // 动态加载 CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/node_modules/docsify/lib/themes/vue.css';
    document.head.appendChild(css);

    // 动态加载 JS
    const js = document.createElement('script');
    js.src = '/node_modules/docsify/lib/docsify.min.js';
    document.body.appendChild(js);


    window.$docsify = {
      name: title,
      loadSidebar: true,
      homepage: "readme.md",
      alias: {
          '/_sidebar.md': './_sidebar.md',
      }
    };


  });

  </script>

  <div id="app">Loading Docsify...</div>