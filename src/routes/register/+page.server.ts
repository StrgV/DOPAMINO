import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

console.log('Register action called'); // Debugging output

export const actions: Actions = {
  register: async ({ request }) => {
    console.log('Register action called'); // Debugging output
    const form = await request.formData();
    const forename = form.get('forename') as string;
    const name = form.get('name') as string;
    const username = form.get('username') as string;
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    // Validierung: Überprüfen, ob alle Felder ausgefüllt sind
    if (!forename || !name || !username || !email || !password) {
      return fail(400, { error: 'Alle Felder sind erforderlich!' });
    }

    console.log('Inserting from form ', {forename, name, username, email, password}); // Debugging output

    // Einfügen des neuen Benutzers in die Datenbank
    await db.insert(user).values({
      id: crypto.randomUUID(),
      forename,
      name,
      username,
      email,
      password, // Hinweis: Passwort sollte später mit bcrypt gehasht werden!
      kontostand: 5000,
      age: null
    });

    // Nach erfolgreicher Registrierung weiterleiten
    throw redirect(303, '/casino');
  }
};