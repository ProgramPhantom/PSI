import { db } from '../db/database.js';

export const SchemeRepository = {
    async deleteById(id: string) {
        return await db
            .deleteFrom('schemes')
            .where('scheme_id', '=', id)
            .executeTakeFirst();
    },
    async saveById(id: string) {
        return await db
            .updateTable('schemes')
            .set({ date_modified: new Date() })
            .where('scheme_id', '=', id)
            .executeTakeFirst();
    },
    async loadById(id: string) {
        return await db
            .selectFrom('schemes')
            .selectAll()
            .where('scheme_id', '=', id)
            .executeTakeFirst();
    },
    async createScheme(
        id: string,
        datetime: Date,
        owner: string,
        name: string,
    ) {
        return await db
            .insertInto('schemes')
            .values({
                scheme_id: id,
                owner: owner,
                name: name,
                date_created: datetime,
                date_modified: datetime,
            })
            .returning('scheme_id')
            .executeTakeFirst();
    },
};
