import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';

console.log('Login action called'); // Debugging output

export const actions: Actions = {
  login: async ({ request }) => {
    const form = await request.formData();
    const username = form.get('username') as string;
    const password = form.get('password') as string;

    // Validierung: Überprüfen, ob alle Felder ausgefüllt sind
    if (!username || !password) {
      return fail(400, { error: 'Benutzername und Passwort sind erforderlich!' });
    }

    // Überprüfen, ob der Benutzer in der Datenbank existiert
    const userRecord = await db
    .select()
    .from(user)
    .where(and(eq(user.username, username), eq(user.password, password)))
    .execute();

    console.log('Login attempt:', { username, password });

    if (userRecord.length === 0) {
      // Benutzername oder Passwort ist falsch
      return fail(401, { error: 'Ungültige Anmeldedaten!' });
    }


    // Weiterleitung zu /casino bei erfolgreicher Anmeldung
    throw redirect(303, '/casino');
  }
};