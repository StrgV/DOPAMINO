<script lang="ts">
	import '../app.css';
	let { children } = $props();
  </script>
  
  <!-- here fonts are embedded globally -->
  <svelte:head>
  	<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text&display=swap" rel="stylesheet" />
  </svelte:head>
  

{@render children()}
