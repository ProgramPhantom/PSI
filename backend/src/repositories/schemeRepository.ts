import { db } from '../db/database.js';
import type { JsonObject } from '../db/db.js';

export const SchemeRepository = {
    async deleteById(id: string) {
        return await db
            .deleteFrom('schemes')
            .where('scheme_id', '=', id)
            .executeTakeFirst();
    },
    async saveById(id: string, json: JsonObject) {
        return await db
            .updateTable('schemes')
            .set({ data: json, date_modified: new Date() })
            .where('scheme_id', '=', id)
            .executeTakeFirst();
    },
    async loadById(id: string) {
        return await db
            .selectFrom('schemes')
            .select(['data', 'name'])
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
                data: {},
            })
            .returning('scheme_id')
            .executeTakeFirst();
    },
};
