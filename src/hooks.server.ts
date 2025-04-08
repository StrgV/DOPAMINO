import { db } from '$lib/server/db';
import { session } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function handle({ event, resolve }) {
  const { url } = event;

  // Exception for the homepage (root URL)
  if (url.pathname === '/' || url.pathname === '/login' || url.pathname === '/register') {
    // No authentication check for the homepage, login, or signup
    return resolve(event);
  }

  // Retrieve the session ID from the cookie
  const sessionId = event.cookies.get('session_id');

  if (!sessionId) {
    // If the cookie does not exist, redirect the user to the login page
    return redirect(303, '/'); // Redirect to the homepage (or wherever your login page is)
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
    event.cookies.delete('session_id', { path: '/' });

    // Redirect the user to the login page
    return redirect(303, '/'); // Redirect to the homepage (or login page)
  }

  // Optional: Set the session data globally for the event, if needed
  event.locals.user = sessionRecord[0]; // User info can be made globally accessible

  return resolve(event); // Continue and process the request
}



// import type { Handle } from '@sveltejs/kit';
// import * as auth from '$lib/server/auth.js';

// const handleAuth: Handle = async ({ event, resolve }) => {
// 	const sessionToken = event.cookies.get(auth.sessionCookieName);
// 	if (!sessionToken) {
// 		event.locals.user = null;
// 		event.locals.session = null;
// 		return resolve(event);
// 	}

// 	const { session, user } = await auth.validateSessionToken(sessionToken);
// 	if (session) {
// 		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
// 	} else {
// 		auth.deleteSessionTokenCookie(event);
// 	}

// 	event.locals.user = user;
// 	event.locals.session = session;

// 	return resolve(event);
// };

// export const handle: Handle = handleAuth;
