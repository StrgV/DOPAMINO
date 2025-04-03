<script lang="ts">
  let isOpen:boolean = false;

  const toggleHamburger = () => {
    isOpen = !isOpen;
  };
</script>

<button 
class="hamburger hamburger--squeeze {isOpen ? 'is-active' : ''}" 
type="button"
on:click={toggleHamburger}
aria-label="Menu" 
aria-controls="navigation">
  <span class="hamburger-box">
    <span class="hamburger-inner"></span>
  </span>
</button>