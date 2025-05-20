<script lang="ts">
    import logo from "$lib/assets/DOPAMINO_Text_Logo.svg";
	import Page from "./casino/+page.svelte";

    let {form} = $props<{
        form?: {
            error?: string;
            values?: {
                username?: string;
            }
        }
    }>();
</script>

<img src="{logo}" alt="Logo of DOPAMINO" class="logo" />
<h2 class="italic">~wir sind dein Casino</h2>
<form method="POST" action="?/login">
    <input name="username" placeholder="Username" value="{form?.values?.username || ''}" />
    <input name="password" type="password" placeholder="Passwort" required />
    <button type="submit">Sign in</button>
</form>

<p>Noch kein Account?</p>
<button onclick = {() => window.location.href = '/register'}>Sign up</button>

<!-- Fehlermeldung anzeigen -->
{#if form?.error}
    <p style="color: red;">{form.error}</p>
{/if}