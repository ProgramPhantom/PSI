import { db } from '../db/database.js';
import type { JsonObject } from '../db/db.js';

export const DiagramRepository = {
  async deleteById(id: string) {
    return await db
      .deleteFrom('diagrams')
      .where('diagram_id', '=', id)
      .executeTakeFirst();
  },
  async saveById(id: string, institution?: string, originalAuthor?: string) {
    return await db
      .updateTable('diagrams')
      .set({ 
        date_modified: new Date(),
        institution: institution,
        original_author: originalAuthor
      })
      .where('diagram_id', '=', id)
      .executeTakeFirst();
  },
  async loadById(id: string) {
    return await db
      .selectFrom('diagrams')
      .selectAll()
      .where('diagram_id', '=', id)
      .executeTakeFirst();
  },
  async getOwnerById(id: string) {
    return await db.selectFrom('diagrams').select('owner').where('diagram_id', '=', id).executeTakeFirst()
  },
  async getModifiedById(id: string) {
    return await db
      .selectFrom('diagrams')
      .select('date_modified')
      .where('diagram_id', '=', id)
      .executeTakeFirst();
  },
  async getDiagramsByOwner(ownerId: string) {
    return await db
      .selectFrom('diagrams')
      .select([
        'name',
        'diagram_id',
        'date_created as dateCreated',
        'institution',
        'original_author as originalAuthor'
      ])
      .where('owner', '=', ownerId)
      .execute();
  },
  async copyDiagramToOwnerById(
    diagramId: string,
    newId: string,
    newOwner: string,
  ) {
    return await db
      .insertInto('diagrams')
      .columns([
        'diagram_id',
        'name',
        'owner',
        'date_created',
        'date_modified',
      ])
      .expression((eb) =>
        eb
          .selectFrom('diagrams')
          .select((eb) => [
            eb.val(newId).as('diagram_id'),
            'name',
            eb.val(newOwner).as('owner'),
            'date_created',
            'date_modified',
          ])
          .where('diagram_id', '=', diagramId),
      )
      .returning('diagram_id')
      .executeTakeFirst();
  },
  async createDiagram(
    id: string,
    datetime: Date,
    owner: string,
    name: string,
    institution?: string,
    originalAuthor?: string
  ) {
    return await db
      .insertInto('diagrams')
      .values({
        diagram_id: id,
        owner: owner,
        name: name,
        date_created: datetime,
        date_modified: datetime,
        institution: institution,
        original_author: originalAuthor
      })
      .returning('diagram_id')
      .executeTakeFirst();
  },
};
