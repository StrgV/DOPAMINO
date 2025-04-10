<script lang="ts">
    export let form: { error?: string; values?: { forename?: string; name?: string; birthday?: string; username?: string; email?: string } };

    /* Date calculations for the birthday input */
    let today:Date = new Date();
    const maxDate:string = today.toISOString().split('T')[0];
    let earliestDate:Date = new Date();
    earliestDate.setFullYear(today.getFullYear() - 120);
    const minDate:string = earliestDate.toISOString().split('T')[0];
</script>

<h1>Register</h1>
<form method="POST" action="?/register">
    <div class="column">
        <input name="forename" placeholder="Vorname" value="{form?.values?.forename}" required />
        <input name="name" placeholder="Nachname" value="{form?.values?.name}" required />
        <input name="birthday" placeholder="Geburtstag" type="date" min="{minDate}" max="{maxDate}" value="{form?.values?.birthday}" required /> <!-- TODO: change age to birthday -->
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
