<script lang="ts">
    export let form: { error?: string; values?: { forename?: string; name?: string; age?: number; username?: string; email?: string } };
</script>

<h1>Register</h1>
<form method="POST" action="?/register">
    <div class="column">
        <input name="forename" placeholder="Vorname" value="{form?.values?.forename}" required />
        <input name="name" placeholder="Nachname" value="{form?.values?.name}" required />
        <input name="age" placeholder="Alter" type="number" min="18" max="120" value="{form?.values?.age}" required />
        <input name="username" placeholder="Benutzername" value="{form?.values?.username}" required />
        <input name="email" type="email" placeholder="E-Mail" value="{form?.values?.email}" required />
        <input name="password" type="password" placeholder="Passwort" required />
        <button type="submit">Sign up</button>
    </div>
</form>

<!-- Fehlermeldung anzeigen -->
{#if form?.error}
    <p style="color: red">{form.error}</p>
{/if}
