import { db } from '../db/database.js';

export const DiagramRepository = {
  async deleteById(id: string) {
    return await db
      .deleteFrom('diagrams')
      .where('diagram_id', '=', id)
      .executeTakeFirst();
  },
  async saveById(id: string, json: string) {
    return await db
      .updateTable('diagrams')
      .set({ data: json })
      .where('diagram_id', '=', id)
      .executeTakeFirst();
  },
  async loadById(id: string) {
    return await db
      .selectFrom('diagrams')
      .select(['data', 'name'])
      .where('diagram_id', '=', id)
      .executeTakeFirst();
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
      .select(['name', 'diagram_id'])
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
        'data',
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
            'data',
            eb.val(newOwner).as('owner'),
            'date_created',
            'date_modified',
          ])
          .where('diagram_id', '=', diagramId),
      )
      .execute();
  },
  async createDiagram(id: string, datetime: string, owner: string, name: string) {
    return await db.insertInto('diagrams').values({
        diagram_id: id,
        owner: owner,
        name: name,
        date_created: datetime,
        date_modified: datetime,
        data: ""
    }).returning('diagram_id').executeTakeFirst()
  }
};
