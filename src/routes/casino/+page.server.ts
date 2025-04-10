import { db } from '$lib/server/db';
import { session } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

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
