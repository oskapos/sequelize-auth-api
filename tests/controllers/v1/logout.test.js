//A Package to allow us make fake requests to our express app
import request from 'supertest';
import TestsHelpers from '../../utils/tests-helpers';
import models from '../../../src/models';

describe('logout', () => {
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
    it('should fail if the access token is not valid', async () => {
      const response = await request(app)
        .post('/v1/logout')
        .set('Authorization', 'Bearer invalid.token')
        .send()
        .expect(401);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Invalid Token');
    });
  });

  it('should logout the user successfully', async () => {
    const accessToken = newUserResponse.body.data.accessToken;
    const response = await request(app)
      .post('/v1/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
      .expect(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.message).toEqual('Successfully logged out');
    const { User, RefreshToken } = models;
    const user = await User.findOne({ where: { email: 'test@example.com' }, include: RefreshToken });
    expect(user.RefreshToken.token).toEqual(null);
  });
});
