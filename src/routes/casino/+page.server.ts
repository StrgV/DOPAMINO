import { db } from '$lib/server/db';
import { session, user } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

export async function load({ cookies }) {
  // Retrieve the session ID from the cookie
  const sessionId = cookies.get('session_id');
  
  if (!sessionId) {
    // If the cookie does not exist, redirect the user to the login page
    return redirect(303, '/');
  }

  // Retrieve the session from the database and check if it exists and is not expired
  const sessionRecord = await db
    .select()
    .from(session)
    .where(eq(session.id, sessionId))
    .execute();

  // Check if the session exists and if it is not expired
  if (sessionRecord.length === 0 || sessionRecord[0].expiresAt.getTime() < Date.now()) {
    // Delete the expired session from the database
    if (sessionRecord.length > 0) {
      await db.delete(session).where(eq(session.id, sessionId)).execute();
    }
    
    // Delete the expired session cookie
    cookies.delete('session_id', { path: '/' });
    
    // Redirect the user to the login page
    return redirect(303, '/');
  }

  // Retrieve the user information associated with the session
  const userRecord = await db
    .select()
    .from(user)
    .where(eq(user.id, sessionRecord[0].userId))
    .execute();

  if (userRecord.length === 0) {
    // This should not happen, but if the user does not exist
    return redirect(303, '/');
  }

  // The session is valid, return the user data for the casino page
  return {
    user: userRecord[0]
  };
}

export const actions: Actions = {
  logout: async ({ request, cookies }) => {
    const sessionId = cookies.get('session_id');

    if (sessionId) {
      // Delete the session from the database
      await db.delete(session).where(eq(session.id, sessionId)).execute();
      // Delete the session cookie
      cookies.delete('session_id', { path: '/' });
    }

    // Redirect the user to the login page
    return redirect(303, '/');
  }
};
