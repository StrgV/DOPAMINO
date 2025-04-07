<script lang="ts">
  import {Hamburger} from 'svelte-hamburgers';
  let open: boolean = $state(false);
  let {children} = $props();
</script>

  <nav>
    <Hamburger bind:open type="squeeze" title="Menü" --color="var(--secondary-color)" ariaControls="nav"/>

    {#if open}
      <ul>
        <li>Eins</li>
        <li>Zwei</li>
        <li><a href="/register">Registrierung</a></li>
      </ul>     
    {/if}

  </nav>

  <main class:blur={open}>
    {@render children()}
  </main>
