<script lang="ts">
	import '../app.css';
	let { children } = $props();
  </script>
  
  <svelte:head>
  <!-- embed fonts globally -->
  	<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text&display=swap" rel="stylesheet" />
    <!-- for hamburger menu usage -->
     <link href="src/hamburgers.css" rel="stylesheet">
  </svelte:head>
  

{@render children()}
