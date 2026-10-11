import request from 'supertest';
import { createApp } from '../src/app';
import { resetDataStoreForTesting } from '../src/config/firestore';

describe('Lists API', () => {
  let app: any;

  beforeEach(() => {
    resetDataStoreForTesting();
    app = createApp();
  });

  it('GET /api/lists returns seeded lists', async () => {
    const res = await request(app).get('/api/lists');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name', 'Weekly Groceries');
  });

  it('POST /api/lists creates a new list', async () => {
    const res = await request(app)
      .post('/api/lists')
      .send({
        name: 'Costco Run',
        description: 'Bulk shopping trip'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Costco Run');
    expect(res.body.description).toBe('Bulk shopping trip');
  });

  it('POST /api/lists rejects empty name', async () => {
    const res = await request(app)
      .post('/api/lists')
      .send({
        name: ''
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/lists/:listId retrieves single list', async () => {
    const listRes = await request(app).get('/api/lists');
    const firstListId = listRes.body[0].id;

    const res = await request(app).get(`/api/lists/${firstListId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(firstListId);
    expect(res.body).toHaveProperty('itemCount');
  });

  it('DELETE /api/lists/:listId deletes list and cascades', async () => {
    const createRes = await request(app)
      .post('/api/lists')
      .send({ name: 'Temporary List' });
    const listId = createRes.body.id;

    const deleteRes = await request(app).delete(`/api/lists/${listId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/lists/${listId}`);
    expect(getRes.status).toBe(404);
  });
});
