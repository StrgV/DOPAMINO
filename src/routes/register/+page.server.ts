import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import type { FailResponse } from '$lib/types';


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

    // Validation: Check if all fields are filled
    if (!forename || !name || !username || !email || !password) {
      return fail<FailResponse>(400, {
        error: 'Alle Felder sind erforderlich!',
        values: { forename, name, username, email }
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
        values: { forename, name, username, email }
        });
    }


    console.log('Inserting from form ', {forename, name, username, email, password}); // Debugging output

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('starting to insert user'); // Debugging output

    // Insert the new user into the database
    await db.insert(user).values({
      id: crypto.randomUUID(),
      forename,
      name,
      username,
      email,
      password: hashedPassword, // Store hashed password
      balance: 5000, // Default balance
      age: null
    });
    
    // Redirect after successful registration
    console.log('Redirecting to /casino');
    throw redirect(303, '/casino');
  }
};