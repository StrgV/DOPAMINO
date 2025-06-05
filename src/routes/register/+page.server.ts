import { db } from '$lib/server/db';
import { user, session } from '$lib/server/db/schema';
import type { Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import type { FailResponse } from '$lib/types';
import { eq } from 'drizzle-orm';

export const actions: Actions = {
  register: async ({ request, cookies }) => {
    const form = await request.formData();
    const forename:string = form.get('forename') as string;
    const name:string = form.get('name') as string;
    const birthdayString:string = form.get('birthday') as string; // birthday as string (YYYY-MM-DD)
    const birthdayTimestamp:number = new Date(birthdayString).getTime(); // birthday timestamp for the database
    const username = form.get('username') as string;
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    // Validation: Check if all fields are filled
    if (!forename || !name || !username || !birthdayString || !email || !password) {
      return fail<FailResponse>(400, {
        error: 'Alle Felder sind erforderlich!',
        values: { forename, name, birthday: birthdayTimestamp, username, email }
      });
      
    }
    
    
    // Check if username already exists
    const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .execute();
    
    if (existingUser.length > 0) {
      return fail<FailResponse>(400, {
        error: 'Benutzername ist bereits vergeben!',
        values: { forename, name, birthday: birthdayTimestamp, username, email }
      });
    }
    
    // Check if age is over 18
    const today = new Date();
    const birthdayDate = new Date(birthdayString);
    let age:number = today.getFullYear() - birthdayDate.getFullYear();
    const monthDiff:number = today.getMonth() - birthdayDate.getMonth();

    if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birthdayDate.getDate()) {
      age--; // Correct age if needed
    }

    if (isNaN(birthdayDate.getTime()) || age < 18) {
      return fail<FailResponse>(400, {
        error: 'Das Alter muss mindestens 18 Jahre betragen!',
        values: { forename, name, birthday: birthdayTimestamp, username, email }
    });
  }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{8,}$/; // At least 8 characters, at least 1 letter and 1 number
    if (passwordRegex.test(password)) {
      console.log('Password is valid');
    }
    else {
      console.log('Password is invalid');
      return fail<FailResponse>(400, {
      error: 'Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.',
      values: { forename, name, birthday: birthdayTimestamp, username, email }
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a unique ID for the user
    const userId = crypto.randomUUID();

    // Insert the new user into the database
    await db.insert(user).values({
      id: userId,
      forename,
      name,
      username,
      email,
      password: hashedPassword, // Store hashed password
      balance: 5000, // Default balance
      birthday: new Date(birthdayTimestamp) // Default birthday
    });
    

    // delete old cookie & session
    const oldSessionId = cookies.get('session_id'); // Retrieve the old session ID from the cookie
    if(oldSessionId) {
      // Delete the old session from the database
      await db.delete(session).where(eq(session.id, oldSessionId)).execute();
      // Delete the old session cookie
      cookies.delete('session_id', { path: '/' });
    }
    
    // AUTO-LOGIN: Create a session for the new user
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day expiration
    
    await db.insert(session).values({
      id: sessionId,
      userId: userId,
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
    
    console.log('Session created for new user:', { sessionId, expiresAt });
    console.log('Redirecting to /casino');
    throw redirect(303, '/casino');
  }
};