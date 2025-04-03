import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';

console.log('Login action called'); // Debugging output

export const actions: Actions = {
  login: async ({ request }) => {
    const form = await request.formData();
    const username = form.get('username') as string;
    const password = form.get('password') as string;

    // Validation: Check if all fields are filled
    if (!username || !password) {
      return fail(400, { error: 'Benutzername und Passwort sind erforderlich!',
        values: { username }
       });
    }

    // Check if the user exists in the database
    const userRecord = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .execute();

    if(userRecord.length === 0) {
      return fail(400, { error: 'Ungültiger Benutzername oder Passwort!',
      values: { username }
      });
    }

    const storedPassword = userRecord[0].password; // Hashed password from the database
    const isPasswordValid = await bcrypt.compare(password, storedPassword);

    if(!isPasswordValid) {
      return fail(400, { error: 'Ungültiger Benutzername oder Passwort!',
      values: { username }
      });
    }
    
    console.log('Login attempt:', { username, password });

    // Redirect to /casino on successful login
    throw redirect(303, '/casino');
  }
};