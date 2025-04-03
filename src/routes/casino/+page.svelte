<script lang="ts">
    import logo from "$lib/assets/DOPAMINO_Text_Logo.svg";

    let isOpen:boolean = false;

    const toggleHamburger = () => {
        isOpen = !isOpen;
    };
</script>

<img src="{logo}" alt="Logo of DOPAMINO" />
<p>Enjoy your stay!</p>
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
