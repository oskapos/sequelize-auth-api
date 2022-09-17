//A Package to allow us make fake requests to our express app
import request from 'supertest';
import TestsHelpers from '../../utils/tests-helpers';
import models from '../../../src/models';

describe('register', () => {
  let app;

  beforeAll(async () => {
    await TestsHelpers.startDb();
    app = TestsHelpers.getApp();
  });

  afterAll(async () => {
    await TestsHelpers.stopDb();
  });

  beforeEach(async () => {
    await TestsHelpers.syncDb();
  });

  it('Should register a new user successfully', async () => {
    await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test123#' }).expect(200);
    const { User } = models;
    const users = await User.findAll();
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@example.com');
  });
});
