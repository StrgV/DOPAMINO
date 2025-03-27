// routes/+page.server.ts
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  register: async ({ request }) => {
    const form = await request.formData();
    const username = form.get('username') as string;
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    if (!username || !email || !password) {
      return fail(400, { missing: true });
    }

    await db.insert(user).values({
      id: crypto.randomUUID(),
      username,
      email,
      password, // später mit bcrypt hashen!
      kontostand: 5000,
      age: null
    });

    return { success: true };
  }
};
