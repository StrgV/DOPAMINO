import { db } from '$lib/server/db';
import { session, user } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';


export async function load({ cookies }) {
    const sessionId = cookies.get('session_id');

    if (!sessionId) {
        throw redirect(303, '/'); // Redirect to login if no session ID
    }

    // Retrieve session and user data
    const sessionRecord = await db
        .select()
        .from(session)
        .where(eq(session.id, sessionId))
        .execute();

    if (sessionRecord.length === 0 || sessionRecord[0].expiresAt.getTime() < Date.now()) {
        if (sessionRecord.length > 0) {
            await db.delete(session).where(eq(session.id, sessionId)).execute(); // Delete expired session from DB
        }
        cookies.delete('session_id', { path: '/' }); // Delete expired session cookie
        throw redirect(303, '/'); // Redirect to login
    }

    const userRecord = await db
        .select()
        .from(user)
        .where(eq(user.id, sessionRecord[0].userId))
        .execute();

    if (userRecord.length === 0) {
        throw redirect(303, '/'); // Redirect if user not found
    }

    console.log('Loaded user:', userRecord[0].username, 'Balance:', userRecord[0].balance); // debugging
    
    return {
        username: userRecord[0].username,
        balance: userRecord[0].balance
    };
}
