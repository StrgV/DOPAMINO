import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db'; // Drizzle setup
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username } = await request.json();

        if (!username) {
            return json({ success: false, error: 'Username is required' }, { status: 400 });
        }

        // Ensure the database connection is established
        if (!db) {
            return json({ success: false, error: 'Database connection not established' }, { status: 500 });
        }

        // Query the database for the user's balance
        const result = await db.select({ balance: user.balance })
            .from(user)
            .where(eq(user.username, username))
            .limit(1);

        if (result.length === 0) {
            return json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const balance = result[0].balance;

        return json({ success: true, balance }, { status: 200 });
    } catch (error) {
        console.error('Error fetching balance:', error);
        return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
};
