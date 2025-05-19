<script lang="ts">
  import {Hamburger} from 'svelte-hamburgers';
  import {onMount, onDestroy} from 'svelte';
  import profileIcon from "$lib/assets/Profile_Icon.svg";
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
        <ul class="nav-list">
          <li><a href="/casino/">Home</a></li>
          <li><a href="/casino/black-jack/">Black Jack</a></li>
          <li><a href="/casino/busdriver/">Busdriver</a></li>
          <li><a href="/../">Registrierung</a></li>
          <li><a href="https://www.bundesweit-gegen-gluecksspielsucht.de/">Geld Aufladen</a></li>
        </ul>
    {/if}
  </nav>

  <div>
    <a href="/casino/profile/" aria-label="Profile">
      <img src="{profileIcon}" alt="Profile Icon" class="profile" />
    </a>
  </div>

  <main class:blur={open}>
    {@render children()}
  </main>
