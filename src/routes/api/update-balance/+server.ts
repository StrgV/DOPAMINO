import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, balance } = await request.json();
        
        if (typeof balance !== 'number' || !username) {
            return json({ success: false, error: 'Invalid balance or username' }, { status: 400 });
        }

        // Update the user's balance in the database
        await db
            .update(user)
            .set({ balance })
            .where(eq(user.username, username))
            .execute();

        return json({ success: true });
    } catch (error) {
        console.error('Error updating balance:', error);
        return json({ success: false, error: 'Server error' }, { status: 500 });
    }
};