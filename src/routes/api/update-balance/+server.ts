import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db'; // dein drizzle setup
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const { username, balance } = await request.json();

    if (!username || balance == null) {
        return json({ error: 'Missing data' }, { status: 400 });
    }

    try {
        await db.update(user).set({ balance }).where(eq(user.username, username));
        return json({ success: true });
    } catch (err) {
        console.error(err);
        return json({ error: 'Database update failed' }, { status: 500 });
    }
};