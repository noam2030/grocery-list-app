import request from 'supertest';
import { createApp } from '../src/app';
import { resetDataStoreForTesting } from '../src/config/firestore';

describe('Items API', () => {
  let app: any;
  let testListId: string;

  beforeEach(async () => {
    resetDataStoreForTesting();
    app = createApp();
    const listsRes = await request(app).get('/api/lists');
    testListId = listsRes.body[0].id;
  });

  it('GET /api/items returns items filtered by listId', async () => {
    const res = await request(app).get(`/api/items?listId=${testListId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].listId).toBe(testListId);
  });

  it('POST /api/items adds a new grocery item', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({
        listId: testListId,
        name: 'Avocados',
        quantity: 4,
        unit: 'pcs',
        category: 'Produce',
        priority: 'high',
        notes: 'Ripe Hass avocados'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Avocados');
    expect(res.body.quantity).toBe(4);
    expect(res.body.unit).toBe('pcs');
    expect(res.body.category).toBe('Produce');
    expect(res.body.isCompleted).toBe(false);
  });

  it('PATCH /api/items/:id toggles isCompleted', async () => {
    const itemsRes = await request(app).get(`/api/items?listId=${testListId}`);
    const item = itemsRes.body[0];

    const patchRes = await request(app)
      .patch(`/api/items/${item.id}`)
      .send({ isCompleted: !item.isCompleted });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.isCompleted).toBe(!item.isCompleted);
  });

  it('PATCH /api/items/:id updates quantity', async () => {
    const itemsRes = await request(app).get(`/api/items?listId=${testListId}`);
    const item = itemsRes.body[0];

    const patchRes = await request(app)
      .patch(`/api/items/${item.id}`)
      .send({ quantity: item.quantity + 3 });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.quantity).toBe(item.quantity + 3);
  });

  it('POST /api/items/clear-completed clears completed items', async () => {
    // Add completed item
    await request(app)
      .post('/api/items')
      .send({
        listId: testListId,
        name: 'Finished Coffee',
        quantity: 1,
        isCompleted: true
      });

    const clearRes = await request(app)
      .post('/api/items/clear-completed')
      .send({ listId: testListId });

    expect(clearRes.status).toBe(200);
    expect(clearRes.body.success).toBe(true);
    expect(clearRes.body.clearedCount).toBeGreaterThan(0);

    // Verify no completed items remain
    const remainingRes = await request(app).get(
      `/api/items?listId=${testListId}&isCompleted=true`
    );
    expect(remainingRes.body.length).toBe(0);
  });

  it('DELETE /api/items/:id removes the item', async () => {
    const itemsRes = await request(app).get(`/api/items?listId=${testListId}`);
    const item = itemsRes.body[0];

    const deleteRes = await request(app).delete(`/api/items/${item.id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/items/${item.id}`);
    expect(getRes.status).toBe(404);
  });
});
