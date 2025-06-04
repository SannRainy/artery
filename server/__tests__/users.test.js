// server/__tests__/users.test.js
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { app, db } = require('../app'); // Impor db dari app.js

// Helper unik untuk pembuatan user dalam lingkup file tes ini
let userTestCounter = 0;
const createUserAndTokenForUserTests = async (userData = {}) => {
  userTestCounter++;
  const uniquePart = `${Date.now()}_${userTestCounter}`;
  const defaultUser = {
    username: `userTest_${uniquePart}`,
    email: `usertest_${uniquePart}@example.com`,
    password: 'password123',
    avatar_url: '/img/default-avatar.png',
    bio: 'Test bio',
    created_at: new Date(),
    updated_at: new Date()
  };
  const finalUserData = { ...defaultUser, ...userData };
  const hashedPassword = await bcrypt.hash(finalUserData.password, 10);
  
  const result = await db('users').insert({
    username: finalUserData.username, email: finalUserData.email,
    password_hash: hashedPassword, avatar_url: finalUserData.avatar_url,
    bio: finalUserData.bio, created_at: finalUserData.created_at, updated_at: finalUserData.updated_at
  });
  
  const userId = result[0];
  if (!userId) throw new Error(`UserTest: Failed to create user ${finalUserData.username}`);
  const user = await db('users').where({ id: userId }).first();
  if (!user) throw new Error(`UserTest: Failed to fetch user ${userId}`);
  
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'your-very-secure-secret-for-tests', { expiresIn: '1h' });
  return { user, token };
};

const avatarFixturePath = path.join(__dirname, 'fixtures', 'test-avatar.png');

describe('User Routes', () => {
  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully', async () => {
      const uniqueUsername = `newreg_${Date.now()}`;
      const uniqueEmail = `newreg_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({ username: uniqueUsername, email: uniqueEmail, password: 'password123' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.user.username).toBe(uniqueUsername);
      expect(res.body.user.avatar_url).toBe('/img/default-avatar.png');
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 if required fields (username) are missing', async () => {
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({ email: `missing_user_${Date.now()}@example.com`, password: 'password123' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe('Missing required fields');
    });

    it('should return 400 if email already exists', async () => {
        const existingEmail = `existing_${Date.now()}@example.com`;
        await createUserAndTokenForUserTests({ email: existingEmail, username: `user_with_existing_email_${Date.now()}` });
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({ username: `another_user_${Date.now()}`, email: existingEmail, password: 'password123' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe('User already exists');
    });
     it('should return 400 if username already exists', async () => {
        const existingUsername = `existing_username_${Date.now()}`;
        await createUserAndTokenForUserTests({ username: existingUsername, email: `email_for_existing_user_${Date.now()}@example.com` });
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({ username: existingUsername, email: `another_email_${Date.now()}@example.com`, password: 'password123' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe('User already exists');
    });
  });

  describe('POST /api/v1/users/login', () => {
    let registeredUser;
    const rawPassword = 'loginpassword123';
    beforeEach(async () => {
        const data = await createUserAndTokenForUserTests({ password: rawPassword });
        registeredUser = data.user;
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: registeredUser.email, password: rawPassword });
      expect(res.statusCode).toEqual(200);
      expect(res.body.user.email).toBe(registeredUser.email);
    });
    // ... tes lain untuk login gagal (password salah, user tidak ada)
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user details with valid token', async () => {
      const { user, token } = await createUserAndTokenForUserTests();
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(user.id);
      expect(res.body.username).toEqual(user.username);
    });
     it('should return 403 if no token is provided', async () => {
        const res = await request(app).get('/api/v1/users/me');
        expect(res.statusCode).toEqual(403); // Sesuai middleware auth.js
    });
  });

  describe('GET /api/v1/users/:id (Get User Profile)', () => {
    it('should get a user profile with counts', async () => {
      const { user: userToView } = await createUserAndTokenForUserTests({ bio: 'A public bio' });
      await db('pins').insert({ title: 'User Pin', image_url: '/uploads/pin.jpg', user_id: userToView.id });
      
      const res = await request(app).get(`/api/v1/users/${userToView.id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.username).toBe(userToView.username);
      expect(res.body.pinsCount).toEqual(1);
    });
    it('should return 404 if user not found', async () => {
        const res = await request(app).get('/api/v1/users/999999'); // ID yang tidak mungkin ada
        expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/v1/users/:id (Update User Profile)', () => {
    let userToUpdate, token;
    beforeEach(async () => {
      const data = await createUserAndTokenForUserTests({ username: 'userToUpdateInitial', bio: 'Initial Bio' });
      userToUpdate = data.user;
      token = data.token;
    });

    it('should update username and bio successfully', async () => {
      const newUsername = `updated_${Date.now()}`;
      const res = await request(app)
        .put(`/api/v1/users/${userToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ username: newUsername, bio: 'Updated bio' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.username).toBe(newUsername);
      expect(res.body.bio).toBe('Updated bio');
    });

    it('should update avatar successfully', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${userToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', avatarFixturePath) // Field name 'avatar'
        .field('username', userToUpdate.username); // Kirim username agar tidak error jika username required
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.avatar_url).toMatch(new RegExp(`^/uploads/avatars/avatar-${userToUpdate.id}-\\d+-\\d+\\.png$`));
      
      // Bersihkan file yang diupload (path relatif dari root proyek)
      const uploadedAvatarPath = path.join(process.cwd(), 'public', res.body.avatar_url);
      if (fs.existsSync(uploadedAvatarPath)) fs.unlinkSync(uploadedAvatarPath);
    });

    it('should return 403 if trying to update another user\'s profile', async () => {
        const { user: anotherUserObj } = await createUserAndTokenForUserTests();
        const res = await request(app)
            .put(`/api/v1/users/${anotherUserObj.id}`) // Mencoba update ID user lain
            .set('Authorization', `Bearer ${token}`)    // Dengan token userToUpdate
            .send({ username: 'maliciousUpdate' });
        expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /api/v1/users/:id/pins', () => {
    it("should return user's pins (without link_url)", async () => {
      const { user: userWithPins } = await createUserAndTokenForUserTests();
      await db('pins').insert([
        { title: 'Pin X', image_url: 'x.jpg', user_id: userWithPins.id, created_at: new Date(Date.now() - 20000) },
        { title: 'Pin Y', image_url: 'y.jpg', user_id: userWithPins.id, created_at: new Date(Date.now() - 10000) },
      ]);
      const res = await request(app).get(`/api/v1/users/${userWithPins.id}/pins`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('Pin Y'); // Order by created_at desc
      expect(res.body[0]).not.toHaveProperty('link_url');
    });
  });

  describe('POST /api/v1/users/:id/follow (Follow/Unfollow)', () => {
    let userToFollow, follower, followerToken;
    beforeEach(async () => {
        const data1 = await createUserAndTokenForUserTests();
        userToFollow = data1.user;
        const data2 = await createUserAndTokenForUserTests();
        follower = data2.user;
        followerToken = data2.token;
    });

    it('should allow a user to follow another user', async () => {
        const res = await request(app)
            .post(`/api/v1/users/${userToFollow.id}/follow`)
            .set('Authorization', `Bearer ${followerToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.following).toBe(true);
    });
    
    it('should allow a user to unfollow if already following', async () => {
        await request(app).post(`/api/v1/users/${userToFollow.id}/follow`).set('Authorization', `Bearer ${followerToken}`); // Follow
        const res = await request(app).post(`/api/v1/users/${userToFollow.id}/follow`).set('Authorization', `Bearer ${followerToken}`); // Unfollow
        expect(res.statusCode).toEqual(200);
        expect(res.body.following).toBe(false);
    });

    it('should prevent following self', async () => {
         const res = await request(app)
            .post(`/api/v1/users/${follower.id}/follow`)
            .set('Authorization', `Bearer ${followerToken}`);
        expect(res.statusCode).toEqual(400);
    });
  });
});