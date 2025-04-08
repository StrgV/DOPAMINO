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





// import { db } from './db'; // Deine DB-Verbindung
// import { user, session } from './db/schema'; // Dein User und Session Schema
// import { encodeBase64url } from '@oslojs/encoding';
// import { sha256 } from '@oslojs/crypto/sha2';

// const DAY_IN_MS = 1000 * 60 * 60 * 24;

// export function generateSessionToken() {
//   const bytes = crypto.getRandomValues(new Uint8Array(18)); // Generiere ein zufälliges Token
//   return encodeBase64url(bytes); // URL-kompatibles Token
// }

// export async function createSession(userId: string, token: string) {
//   const sessionId = sha256(new TextEncoder().encode(token)); // Hash des Tokens
//   const expiresAt = new Date(Date.now() + DAY_IN_MS * 30); // Session läuft 30 Tage

//   // Speichere die Session in der DB
//   const id = crypto.randomUUID(); // Generate a unique ID for the session
//   await db.insert(session).values({
//     id,
//     userId,
//     expiresAt,
//   });

//   return { sessionId, expiresAt };
// }

// export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
//   event.cookies.set('auth-session', token, {
//     expires: expiresAt,
//     path: '/',
//   });
// }

// export async function validateSessionToken(token: string) {
//   const sessionId = sha256(new TextEncoder().encode(token)); // Hash des Tokens
//   const session = await db
//     .select()
//     .from('session')
//     .where({ sessionId })
//     .execute();

//   if (!session) {
//     return { session: null, user: null };
//   }

//   const user = await db
//     .select()
//     .from('user')
//     .where({ id: session.userId })
//     .execute();

//   const sessionExpired = Date.now() >= session.expiresAt.getTime();
//   if (sessionExpired) {
//     await db.delete('session').where({ sessionId });
//     return { session: null, user: null };
//   }

//   return { session, user };
// }

// export function deleteSessionTokenCookie(event: RequestEvent) {
//   event.cookies.delete('auth-session', {
//     path: '/',
//   });
// }






// // import type { RequestEvent } from '@sveltejs/kit';
// // import { eq } from 'drizzle-orm';
// // import { sha256 } from '@oslojs/crypto/sha2';
// // import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
// // import { db } from '$lib/server/db';
// // import * as table from '$lib/server/db/schema';

// // const DAY_IN_MS = 1000 * 60 * 60 * 24;

// // export const sessionCookieName = 'auth-session';

// // export function generateSessionToken() {
// // 	const bytes = crypto.getRandomValues(new Uint8Array(18));
// // 	const token = encodeBase64url(bytes);
// // 	return token;
// // }

// // export async function createSession(token: string, userId: string) {
// // 	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
// // 	const session: table.Session = {
// // 		id: sessionId,
// // 		userId,
// // 		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
// // 	};
// // 	await db.insert(table.session).values(session);
// // 	return session;
// // }

// // export async function validateSessionToken(token: string) {
// // 	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
// // 	const [result] = await db
// // 		.select({
// // 			// Adjust user table here to tweak returned data
// // 			user: { id: table.user.id, username: table.user.username },
// // 			session: table.session
// // 		})
// // 		.from(table.session)
// // 		.innerJoin(table.user, eq(table.session.userId, table.user.id))
// // 		.where(eq(table.session.id, sessionId));

// // 	if (!result) {
// // 		return { session: null, user: null };
// // 	}
// // 	const { session, user } = result;

// // 	const sessionExpired = Date.now() >= session.expiresAt.getTime();
// // 	if (sessionExpired) {
// // 		await db.delete(table.session).where(eq(table.session.id, session.id));
// // 		return { session: null, user: null };
// // 	}

// // 	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
// // 	if (renewSession) {
// // 		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
// // 		await db
// // 			.update(table.session)
// // 			.set({ expiresAt: session.expiresAt })
// // 			.where(eq(table.session.id, session.id));
// // 	}

// // 	return { session, user };
// // }

// // export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

// // export async function invalidateSession(sessionId: string) {
// // 	await db.delete(table.session).where(eq(table.session.id, sessionId));
// // }

// // export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
// // 	event.cookies.set(sessionCookieName, token, {
// // 		expires: expiresAt,
// // 		path: '/'
// // 	});
// // }

// // export function deleteSessionTokenCookie(event: RequestEvent) {
// // 	event.cookies.delete(sessionCookieName, {
// // 		path: '/'
// // 	});
// // }


