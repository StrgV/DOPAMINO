import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db'; // Import the Drizzle database instance
import { user } from '$lib/server/db/schema'; // Import the user schema
import { eq } from 'drizzle-orm'; // Import the equality operator for queries


export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username } = await request.json();

        if (!username) {
            return new Response(
                JSON.stringify({ success: false, error: 'Username is required' }),
                { status: 400 }
            );
        }

        // Query the database for the user's balance
        const result = await db.select({ balance: user.balance })
            .from(user)
            .where(eq(user.username, username))
            .limit(1);

        if (result.length === 0) {
            return new Response(
                JSON.stringify({ success: false, error: 'User not found' }),
                { status: 404 }
            );
        }

        const balance = result[0].balance;

        return new Response(
            JSON.stringify({ success: true, balance }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching balance:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Internal Server Error' }),
            { status: 500 }
        );
    }
};
