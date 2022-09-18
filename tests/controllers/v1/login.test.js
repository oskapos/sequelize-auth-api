//A Package to allow us make fake requests to our express app
import request from 'supertest';
import TestsHelpers from '../../utils/tests-helpers';
import models from '../../../src/models';

describe('login', () => {
  let app;
  let newUserResponse;

  beforeAll(async () => {
    await TestsHelpers.startDb();
    app = TestsHelpers.getApp();
  });

  afterAll(async () => {
    await TestsHelpers.stopDb();
  });

  beforeEach(async () => {
    await TestsHelpers.syncDb();
    newUserResponse = await TestsHelpers.registerNewUser({ email: 'test@example.com', password: 'Test123#' });
  });

  it('should login a user successfully and store the refresh token in the database ', async () => {
    const response = await request(app)
      .post('/v1/login')
      .send({ email: 'test@example.com', password: 'Test123#' })
      .expect(200);
    const refreshToken = response.body.data.refreshToken;
    const { RefreshToken } = models;
    const savedRefreshToken = await RefreshToken.findOne({ where: { token: refreshToken } });
    expect(savedRefreshToken).toBeDefined();
    expect(savedRefreshToken.token).toEqual(refreshToken);
  });

  it('should return 401 if the user is not found', async () => {
    const response = await request(app)
      .post('/v1/login')
      .send({ email: 'invalid.user@example.com', password: 'Test123#' })
      .expect(401);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual('Invalid credentials');
  });

  it('should return 401 if the user is invalid', async () => {
    const response = await request(app)
      .post('/v1/login')
      .send({ email: 'test@example.com', password: 'Test123!' })
      .expect(401);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual('Invalid credentials');
  });

  it('should return the same refresh token if the user is already logged in', async () => {
    const response = await request(app)
      .post('/v1/login')
      .send({ email: 'test@example.com', password: 'Test123#' })
      .expect(200);
    expect(response.body.data.refreshToken).toEqual(newUserResponse.body.data.refreshToken);
  });

  it("should create new refresh token record if there isn't one associated with the user", async () => {
    const { RefreshToken } = models;
    await RefreshToken.destroy({ where: {} });
    let refreshToken = await RefreshToken.findAll();
    expect(refreshToken.length).toEqual(0);
    await request(app).post('/v1/login').send({ email: 'test@example.com', password: 'Test123#' }).expect(200);
    refreshToken = await RefreshToken.findAll();
    expect(refreshToken.length).toEqual(1);
    expect(refreshToken[0].token).not.toBeNull();
  });

  it('should set token field to a JWT if this field is empty', async () => {
    const { RefreshToken } = models;
    const refreshToken = newUserResponse.body.data.refreshToken;
    const savedRefreshToken = await RefreshToken.findOne({ where: { token: refreshToken } });
    savedRefreshToken.token = null;
    await savedRefreshToken.save();
    await request(app).post('/v1/login').send({ email: 'test@example.com', password: 'Test123#' }).expect(200);
    await savedRefreshToken.reload();
    expect(savedRefreshToken.token).not.toBeNull();
  });
});
