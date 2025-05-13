<script lang="ts">
	import '../app.css';
	import { balanceStore } from '$lib/stores/balanceStore';
  import { onMount } from 'svelte';
  
  // let { children } = $props();
  
  const props = $props<{
    children: any; 
    data?: {
      balance?: number;
      username?: string;
    };
  }>();

  // Initialize the store with the data from the server on initial load
	onMount(() => {
		if (props.data && props.data.balance !== undefined) {
			balanceStore.set(props.data.balance);
			console.log('Set initial balance in store:', props.data.balance);
		}
	});


</script>
  
  <svelte:head>
    <!-- embed fonts globally -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Serif+Text:ital@0;1&family=Roboto+Serif:ital,opsz,wght@0,8..144,100..900;1,8..144,100..900&display=swap');
    </style>

  </svelte:head>
  
{@render props.children()}