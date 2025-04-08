import { db } from '$lib/server/db';
import { user, session } from '$lib/server/db/schema';
import type { Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';


export const actions: Actions = {
  login: async ({ request, cookies }) => {
    
    console.log('Login action called'); // Debugging output

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
    
    console.log('Login attempt:', { username });

    const oldSessionId = cookies.get('session_id'); // Retrieve the old session ID from the cookie
    if(oldSessionId) {
      // Delete the old session from the database
      await db.delete(session).where(eq(session.id, oldSessionId)).execute();
      // Delete the old session cookie
      cookies.delete('session_id', { path: '/' });
    }

    const sessionId = crypto.randomUUID(); // Create a new session ID
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day expiration

    await db.insert(session).values({
      id: sessionId,
      userId: userRecord[0].id,
      expiresAt: expiresAt,
    }).execute();

    // Set the session cookie
    cookies.set('session_id', sessionId, {
      httpOnly: true, // Cookie is only accessible via HTTP
      path: '/', // Cookie applies to all pages
      maxAge: 60 * 60 * 24, // Cookie expires after 1 day
      secure: true,
      sameSite: 'strict', // CSRF protection
    });
    
    console.log('Session created:', { sessionId, expiresAt });
    
    // Redirect to /casino on successful login
    throw redirect(303, '/casino');
  }
};