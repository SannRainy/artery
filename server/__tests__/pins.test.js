// server/__tests__/pins.test.js
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { app, db: appDb } = require('../app'); // Gunakan db dari app.js

// Helper unik untuk pembuatan user dalam lingkup file tes ini
let pinTestUserCounter = 0;
const createUserAndTokenForPinTests = async (userData = {}) => {
  pinTestUserCounter++;
  const uniquePart = `${Date.now()}_${pinTestUserCounter}`;
  const defaultUser = {
    username: `pinCreator_${uniquePart}`,
    email: `pincreator_${uniquePart}@example.com`,
    password: 'password123',
    avatar_url: '/img/default-avatar.png',
    bio: 'Pin Creator Bio',
    created_at: new Date(),
    updated_at: new Date()
  };
  const finalUserData = { ...defaultUser, ...userData };
  const hashedPassword = await bcrypt.hash(finalUserData.password, 10);
  
  const result = await appDb('users').insert({
    username: finalUserData.username, email: finalUserData.email,
    password_hash: hashedPassword, avatar_url: finalUserData.avatar_url,
    bio: finalUserData.bio, created_at: finalUserData.created_at, updated_at: finalUserData.updated_at
  });
  
  const userId = result[0];
  if (!userId) throw new Error(`PinTest: Failed to create user ${finalUserData.username}`);
  const user = await appDb('users').where({id: userId}).first();
  if (!user) throw new Error(`PinTest: Failed to fetch user ${userId}`);
  
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'your-test-secret', { expiresIn: '1h' });
  return { user, token };
};

const imageFixturePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
// Fixture setup ada di setup.js global

describe('Pin Routes', () => {
  let mainUser, mainToken;
  let otherUser, otherToken; 

  beforeEach(async () => {
    const data1 = await createUserAndTokenForPinTests({username: 'UserAForPins'});
    mainUser = data1.user;
    mainToken = data1.token;
    const data2 = await createUserAndTokenForPinTests({username: 'UserBForPins'});
    otherUser = data2.user;
    otherToken = data2.token;
  });


  describe('POST /api/v1/pins (Create Pin)', () => {
    it('should create a new pin with title, image, and category (as tag)', async () => {
      const res = await request(app)
        .post('/api/v1/pins')
        .set('Authorization', `Bearer ${mainTestToken}`)
        .field('title', 'My First Awesome Pin')
        .field('description', 'Detailed description of my first pin')
        .field('category', 'Photography') // Kategori akan menjadi tag
        .attach('image_url', imageFixturePath); // Sesuai nama field di Multer

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toBe('My First Awesome Pin');
      expect(res.body.user.id).toBe(mainTestUser.id); // Server mengembalikan objek user
      expect(res.body.tags[0].name).toBe('photography'); // Kategori di-lowercase

      const uploadedPinPath = path.join(process.cwd(), 'public', res.body.image_url);
      if (fs.existsSync(uploadedPinPath)) fs.unlinkSync(uploadedPinPath);
    });

    it('should return 400 if title is missing when creating a pin', async () => {
        const res = await request(app)
            .post('/api/v1/pins')
            .set('Authorization', `Bearer ${mainTestToken}`)
            .field('category', 'NoTitleCategory')
            .attach('image_url', imageFixturePath);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe('Title is required.');
    });
     it('should return 400 if image_url is missing when creating a pin', async () => {
        const res = await request(app)
            .post('/api/v1/pins')
            .set('Authorization', `Bearer ${mainTestToken}`)
            .field('title', 'No Image Pin')
            .field('category', 'NoImageCategory');
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe('Image file is required.');
    });
  });

  describe('GET /api/v1/pins (Get Pins List)', () => {
    let pinAlpha, pinBeta, tagNature, tagUrban;
     beforeEach(async () => {
        // Knex insert untuk MySQL tidak selalu mengembalikan '*' dengan mudah, kita insert lalu fetch jika perlu detail lengkap.
        // Cukup insert ID untuk foreign key.
        const [pinAlphaId] = await appDb('pins').insert({ title: 'Nature Pin', image_url: 'nature.jpg', user_id: mainTestUser.id, created_at: new Date(Date.now() - 20000) });
        const [pinBetaId] = await appDb('pins').insert({ title: 'Urban Pin', image_url: 'urban.jpg', user_id: anotherTestUser.id, created_at: new Date(Date.now() - 10000) });
        pinAlpha = { id: pinAlphaId, title: 'Nature Pin' }; // Simpan data relevan untuk asserstions
        pinBeta = { id: pinBetaId, title: 'Urban Pin' };

        const [tagNatureId] = await appDb('tags').insert({ name: 'nature' });
        const [tagUrbanId] = await appDb('tags').insert({ name: 'urban' });
        tagNature = { id: tagNatureId };
        tagUrban = { id: tagUrbanId };

        await appDb('pin_tags').insert({ pin_id: pinAlpha.id, tag_id: tagNature.id });
        await appDb('pin_tags').insert({ pin_id: pinBeta.id, tag_id: tagUrban.id });
    });

    it('should get a list of pins with user and tag info', async () => {
      const res = await request(app).get('/api/v1/pins').set('Authorization', `Bearer ${mainTestToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(2);
      const foundPinBeta = res.body.data.find(p => p.title === 'Urban Pin');
      const foundPinAlpha = res.body.data.find(p => p.title === 'Nature Pin');
      
      expect(foundPinBeta.user.username).toBe(anotherTestUser.username);
      expect(foundPinAlpha.user.username).toBe(mainTestUser.username);
      expect(foundPinAlpha.tags[0].name).toBe('nature');
    });
    it('should filter pins by category "urban"', async () => {
        const res = await request(app).get('/api/v1/pins?category=urban').set('Authorization', `Bearer ${mainTestToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].title).toBe('Urban Pin');
    });
  });
  
  describe('GET /api/v1/pins/:id (Get Pin Detail)', () => {
    let detailPin;
    beforeEach(async () => {
        const [pinId] = await appDb('pins').insert({ title: 'Detail Test Pin', description: 'A detailed pin.', image_url: 'detail_test.jpg', user_id: mainTestUser.id});
        detailPin = {id: pinId};
        const [tagId] = await appDb('tags').insert({name: 'super-detail'});
        await appDb('pin_tags').insert({pin_id: detailPin.id, tag_id: tagId});
        await appDb('pin_likes').insert({pin_id: detailPin.id, user_id: anotherTestUser.id}); // Liked by otherUser
        await appDb('pin_comments').insert({pin_id: detailPin.id, user_id: anotherTestUser.id, text: 'Great detailed pin!'});
    });

    it('should get full pin details, including is_liked for the logged-in user', async () => {
        await appDb('pin_likes').insert({pin_id: detailPin.id, user_id: mainTestUser.id}); // mainTestUser juga like

        const res = await request(app)
            .get(`/api/v1/pins/${detailPin.id}`)
            .set('Authorization', `Bearer ${mainTestToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toBe(detailPin.id);
        expect(res.body.title).toBe('Detail Test Pin');
        expect(res.body.user.username).toBe(mainTestUser.username);
        expect(res.body.tags[0].name).toBe('super-detail');
        expect(res.body.like_count).toBe(2);
        expect(res.body.is_liked).toBe(true); // Karena mainTestToken yang request
        expect(res.body.comments.length).toBe(1);
        expect(res.body.comments[0].text).toBe('Great detailed pin!');
    });
    it('should return 404 if pin not found', async () => {
        const res = await request(app).get('/api/v1/pins/9999999').set('Authorization', `Bearer ${mainTestToken}`);
        expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /api/v1/pins/:pinId/like (Toggle Like)', () => {
    let pinToToggleLike;
    beforeEach(async() => {
        
        const [pinId] = await db('pins').insert({ title: 'Like Toggle Pin', image_url: 'toggle.jpg', user_id: otherUser.id }); // Gunakan otherUser.id
        pinToToggleLike = {id: pinId};
    });
    it('should get full pin details, including is_liked for the logged-in user', async () => {
    // Pastikan mainTestUser.id ada dan benar
    await db('pin_likes').insert({pin_id: detailPin.id, user_id: mainTestUser.id}); 

    const res = await request(app)
        .get(`/api/v1/pins/${detailPin.id}`)
        .set('Authorization', `Bearer ${mainTestToken}`);

        expect(res.statusCode).toEqual(200);
        // ...
        expect(res.body.like_count).toBe(2);
        console.log("Pin Detail Response for is_liked test:", res.body);
        expect(res.body.is_liked).toBe(true);
        // ...
    });
    it('should unlike an already liked pin', async () => {
        await request(app).post(`/api/v1/pins/${pinToToggleLike.id}/like`).set('Authorization', `Bearer ${mainTestToken}`); // Like
        const res = await request(app).post(`/api/v1/pins/${pinToToggleLike.id}/like`).set('Authorization', `Bearer ${mainTestToken}`); // Unlike
        expect(res.statusCode).toEqual(200);
        expect(res.body.liked).toBe(false);
        expect(res.body.new_like_count).toBe(0);
    });
  });
  
  describe('POST /api/v1/pins/:pinId/comments (Add Comment)', () => {
    let pinToReceiveComment;
    beforeEach(async () => {
        const [pinId] = await appDb('pins').insert({ title: 'Comment Target Pin', image_url: 'target.jpg', user_id: otherTestUser.id });
        pinToReceiveComment = {id: pinId};
    });
    it('should add a comment successfully', async () => {
        const res = await request(app)
            .post(`/api/v1/pins/${pinToReceiveComment.id}/comments`)
            .set('Authorization', `Bearer ${mainTestToken}`)
            .send({ text: 'A fantastic comment!' });
        expect(res.statusCode).toEqual(201);
        expect(res.body.text).toBe('A fantastic comment!');
        expect(res.body.user.id).toBe(mainTestUser.id);
    });
  });

  describe('GET /api/v1/pins/search', () => {
    beforeEach(async () => {
        const [pinTechId] = await appDb('pins').insert({ title: 'Advanced Technology Insights', description: 'Exploring new tech.', image_url: 'search_tech.jpg', user_id: mainTestUser.id });
        const [pinArtId] = await appDb('pins').insert({ title: 'Abstract Art Today', description: 'Modern art discussion.', image_url: 'search_art.jpg', user_id: otherTestUser.id });
        const [tagIdTech] = await appDb('tags').insert({ name: 'technology' });
        await appDb('pin_tags').insert({ pin_id: pinTechId, tag_id: tagIdTech });
    });
    it('should find pins by title search query', async () => {
        const res = await request(app).get('/api/v1/pins/search?query=Advanced').set('Authorization', `Bearer ${mainTestToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].title).toContain('Advanced Technology');
    });
    it('should find pins by tag search query', async () => {
        const res = await request(app).get('/api/v1/pins/search?query=technology').set('Authorization', `Bearer ${mainTestToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        // Verifikasi lebih lanjut bahwa pin yang dikembalikan memang memiliki tag 'technology'
        const pinWithTag = res.body.data[0];
        const hasTechTag = pinWithTag.tags.some(tag => tag.name === 'technology');
        expect(hasTechTag).toBe(true);
    });
    it('should return empty array if no pins match search query', async () => {
        const res = await request(app).get('/api/v1/pins/search?query=NonExistentQueryXYZ').set('Authorization', `Bearer ${mainTestToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(0);
    });
  });
});