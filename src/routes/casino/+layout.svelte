<script lang="ts">
  import {Hamburger} from 'svelte-hamburgers';
  import {onMount, onDestroy} from 'svelte';
  let open: boolean = $state(false);

  const closeMenu = () => {
    open = false;
  };

  // Close hamburger on click, or esc-key
  const handleMouseClick = (event: MouseEvent) => {
    closeMenu();
  };

  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape'){
      closeMenu();
    }
  };

  // Add eventlisteners
  onMount(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleMouseClick);
      document.addEventListener('keydown', handleEsc);
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleMouseClick);
      document.removeEventListener('keydown', handleEsc);
    }
  });

  let {children} = $props();
</script>

  <nav>
    <Hamburger bind:open type="squeeze" title="Menü" --color="var(--secondary-color)" ariaControls="nav"/>

    {#if open}
      <ul>
        <li><a href="/casino/black-jack">Black Jack</a></li>
        <li><a href="/casino">Home</a></li>
        <li><a href="/register">Registrierung</a></li>
        <li><a href="https://www.bundesweit-gegen-gluecksspielsucht.de/">Geld Aufladen</a></li>
      </ul>     
    {/if}

  </nav>

  <main class:blur={open}>
    {@render children()}
  </main>
