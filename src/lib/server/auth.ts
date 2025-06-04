import { db } from '$lib/server/db';
import { user, session } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

// Login logic
export const login = async (username: string, password: string, cookies: any) => {
  // Check if the user exists
  const userRecord = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .execute();

  if (userRecord.length === 0) {
    // If the user does not exist
    return fail(400, { error: 'Invalid username or password!' });
  }

  const storedPassword = userRecord[0].password;

  // Compare the entered password with the password stored in the database
  const isPasswordValid = await bcrypt.compare(password, storedPassword);

  if (!isPasswordValid) {
    return fail(400, { error: 'Invalid username or password!' });
  }

  // Create a session ID
  const sessionId = crypto.randomUUID();

  // Set an expiration date for the session (e.g., 1 hour)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Create a new session entry in the database
  await db.insert(session).values({
    id: sessionId,
    userId: userRecord[0].id,
    expiresAt: expiresAt,
  });

  // Set the session cookie
  cookies.set('session_id', sessionId, {
    httpOnly: true, // Cookie is only accessible via HTTP
    path: '/', // Cookie applies to all pages
    maxAge: 60 * 60 * 24 * 7, // Cookie expires after 7 days
  });

  // Redirect to the protected page (e.g., Casino)
  return redirect(303, '/casino');
};

// Registration logic (optional)
export const register = async (forename: string, name: string, username: string, email: string, password: string) => {
  // Check if the username already exists
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .execute();

  if (existingUser.length > 0) {
    return fail(400, { error: 'Username is already taken!' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user in the database
  await db.insert(user).values({
    id: crypto.randomUUID(),
    forename,
    name,
    username,
    email,
    password: hashedPassword,
    balance: 5000, // Initial balance
    age: 18, // Minimum age
  });

  // Redirect after successful registration)
  return redirect(303, '/casino');
};