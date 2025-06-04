<script lang="ts">
    import type { FailResponse } from '$lib/types';
    
    // using the props
        let {form} = $props<{
        form?: {
            error?: string;
            values?: {
                forename?: string;
                name?: string;
                birthday?: number;
                username?: string;
                email?: string;
            }
        }
    }>();

    /* Date calculations for the birthday input */
    let today: Date = new Date();
    const maxDate: string = today.toISOString().split('T')[0];
    let earliestDate: Date = new Date();
    earliestDate.setFullYear(today.getFullYear() - 120);
    const minDate: string = earliestDate.toISOString().split('T')[0];
    
    // Function to convert timestamp to YYYY-MM-DD format
    const formatDateForInput = (timestamp?: number): string => {
        if (!timestamp) return '';
        return new Date(timestamp).toISOString().split('T')[0];
    };
</script>

<h1>Registrierung</h1>

<!-- Fehlermeldung anzeigen -->
{#if form?.error}
    <p style="color: red">{form?.error}</p>
{/if}

<form method="POST" action="?/register">
    <div class="column">
        <input name="forename" placeholder="Vorname" value="{form?.values?.forename}" required />
        <input name="name" placeholder="Nachname" value="{form?.values?.name}" required />
        <input name="birthday" placeholder="Geburtstag" type="date" 
               min="{minDate}" max="{maxDate}" 
               value="{formatDateForInput(form?.values?.birthday)}" 
               required />
        <input name="username" placeholder="Benutzername" value="{form?.values?.username}" required />
        <input name="email" type="email" placeholder="E-Mail" value="{form?.values?.email}" required />
        <input name="password" type="password" placeholder="Passwort" required />
        <button type="submit">Registrieren</button>
    </div>
</form>

