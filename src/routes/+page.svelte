<script lang="ts">
    import logo from "$lib/assets/DOPAMINO_Text_Logo.svg";
    // export let form: { error?: string }
    export let form: { error?: string; values?: { username?: string; email?: string } };
</script>

<img src="{logo}" alt="Logo of DOPAMINO" />
<h2 class="italic">~wir sind dein Casino</h2>

<form method="POST" action="?/login">
    <input name="username" placeholder="Username" value="{form?.values?.username}" />
    <!-- <input name="email" type="email" placeholder="E-Mail" required /> -->
    <input name="password" type="password" placeholder="Passwort" required />
    <button type="submit">Sign in</button>
    
</form>

<p>Noch kein Account?</p>
<button on:click={() => window.location.href = '/register'}>Sign up</button>


<!-- Fehlermeldung anzeigen -->
{#if form?.error}
    <p style="color: red;">{form.error}</p>
{/if}