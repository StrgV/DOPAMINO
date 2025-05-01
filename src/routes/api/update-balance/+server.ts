import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db'; // Drizzle setup
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, balance } = await request.json();

        if (!username || balance === undefined) {
            return json({ success: false, error: 'Username and balance are required' }, { status: 400 });
        }

        // Ensure the database connection is established
        if (!db) {
            return json({ success: false, error: 'Database connection not established' }, { status: 500 });
        }

        // Update the user's balance in the database
        const result = await db.update(user)
            .set({ balance })
            .where(eq(user.username, username));

        return json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error updating balance:', error);
        return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
};
