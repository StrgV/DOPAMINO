<script lang="ts">
	import '../app.css';
	let { children } = $props();
  </script>
  
  <svelte:head>
    <!-- embed fonts globally -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Serif+Text:ital@0;1&family=Roboto+Serif:ital,opsz,wght@0,8..144,100..900;1,8..144,100..900&display=swap');
    </style>

  </svelte:head>
  
{@render children()}
