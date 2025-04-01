import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// schema for the database
// user table
export const user = sqliteTable('user', {
    id: text('id').primaryKey(),
    forename: text('forename').notNull(),
    name: text('name').notNull(),
    username: text('username').notNull(),
    email: text('email').notNull(),
    password: text('password').notNull(),
    balance: integer('balance').default(5000),
    age: integer('age')
});

// session table
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});


// tables
export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;



