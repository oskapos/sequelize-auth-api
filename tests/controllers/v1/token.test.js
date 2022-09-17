//A Package to allow us make fake requests to our express app
import request from 'supertest';
import TestsHelpers from '../../utils/tests-helpers';
import models from '../../../src/models';

describe('token', () => {
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

  describe('requiresAuth middleware', () => {
    it('should fail if the refresh token is not valid', async () => {
      const response = await request(app)
        .post('/v1/token')
        .set('Authorization', 'Bearer invalid.token')
        .send()
        .expect(401);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Invalid Token');
    });

    it('should fail if no auth header is present', async () => {
      const response = await request(app).post('/v1/token').send().expect(401);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('authorization header not found');
    });

    it('should fail if the auth header token is malformed', async () => {
      const response = await request(app)
        .post('/v1/token')
        .set('Authorization', 'InvalidAuthHeader')
        .send()
        .expect(401);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Bearer token malformed');
    });
  });

  it('should get a new access token successfully', async () => {
    const refreshToken = newUserResponse.body.data.refreshToken;
    const response = await request(app)
      .post('/v1/token')
      .set('Authorization', `Bearer ${refreshToken}`)
      .send()
      .expect(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.data).toEqual({ accessToken: expect.any(String) });
  });

  it('should return 401 if there is no saved refresh token for the user', async () => {
    const { RefreshToken } = models;
    const refreshToken = newUserResponse.body.data.refreshToken;
    await RefreshToken.destroy({ where: { token: refreshToken } });
    const response = await request(app)
      .post('/v1/token')
      .set('Authorization', `Bearer ${refreshToken}`)
      .send()
      .expect(401);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual('You must log in first');
  });
});
