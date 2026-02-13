import { db } from '../db/database.js';
import type { Insertable } from 'kysely'
import type { Users } from '../db/db.js';

export const UserRepository = {
    async createUser(newUser: Insertable<Users>) {
        return await db.insertInto('users').values(newUser).executeTakeFirst()
    },
    async getUserById(id: string) {
        return await db.selectFrom('users').selectAll().where('gsub', '=', id).executeTakeFirst()
    },
    async deleteUserById(id: string) {
        return await db.deleteFrom('users').where('gsub', '=', id).executeTakeFirst();
    }
}