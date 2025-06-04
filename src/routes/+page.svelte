<script lang="ts">
    import logo from "$lib/assets/DOPAMINO_Text_Logo.svg";

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
    <input name="password" type="password" placeholder="Password" required />
    <button type="submit">Anmelden</button>
</form>

<div class="register">
    <p>Noch kein Account?</p>
    <button onclick = {() => window.location.href = '/register'}>Registrieren</button>
</div>

<!-- Fehlermeldung anzeigen -->
{#if form?.error}
    <p style="color: red;">{form.error}</p>
{/if}

<style>
.register{
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: 5%;
}

.register button {
    background-color: var(--primary-color);
}
</style>