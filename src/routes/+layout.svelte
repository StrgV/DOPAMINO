<script lang="ts">
	import '../app.css';
  import {Hamburger} from 'svelte-hamburgers';
	let { children } = $props();

  let open: boolean = $state(false);
  </script>
  
  <svelte:head>
  <!-- embed fonts globally -->
  	<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text&display=swap" rel="stylesheet" />
  </svelte:head>
  
  <nav>
    <Hamburger bind:open type="squeeze" title="Menü" --color="var(--secondary-color)" ariaControls="nav"/>

    {#if open}
      <ul>
        <li>Test1</li>
        <li>Test2</li>
        <li>Test3</li>
      </ul>
    {/if}

  </nav>

{@render children()}