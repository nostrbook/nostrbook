

<script lang="ts">
  import { onMount } from 'svelte';
  
  let data = '';
  
  onMount(async () => {
    const response = await fetch(''); // 对应 +server.ts 的路由
    data = await response.text();
  });
</script>

<pre>
{data}
</pre>


