// server/__tests__/pins.test.js
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { app, db } = require('../app'); // Impor db dari app.js secara konsisten

// Helper unik untuk pembuatan user (bisa diekstrak jika dipakai di banyak file tes)
let pTestUserCounterPins = 0; 
const createUserAndTokenForPins = async (userData = {}) => {
  pTestUserCounterPins++;
  const uniquePart = `${Date.now()}_${pTestUserCounterPins}`;
  const defaultUser = {
    username: `pinner_${uniquePart}`,
    email: `pinner_${uniquePart}@example.com`,
    password: 'password123',
    avatar_url: '/img/default-avatar.png',
    bio: 'Pin Test User Bio',
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
  if (!userId) throw new Error(`PinTestHelper: Failed to create user ${finalUserData.username}. Result: ${JSON.stringify(result)}`);
  const user = await db('users').where({id: userId}).first();
  if (!user) throw new Error(`PinTestHelper: Failed to fetch user ${userId}`);
  
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined for pin tests! Check .env and setup.js.');
  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
  return { user, token };
};

const imageFixturePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
// setup.js seharusnya sudah menangani pembuatan direktori fixtures dan file dummy di beforeAll global

describe('Pin Routes', () => {
  let mainUser, mainToken;
  let otherUser, otherToken;

  // User dibuat ulang SEBELUM SETIAP TES dalam suite 'Pin Routes'
  // Ini berjalan SETELAH beforeEach dari setup.js (yang membersihkan DB)
  beforeEach(async () => {
    const data1 = await createUserAndTokenForPins({username: 'MainPinUser'});
    mainUser = data1.user;
    mainToken = data1.token;

    const data2 = await createUserAndTokenForPins({username: 'OtherPinUser'});
    otherUser = data2.user;
    otherToken = data2.token;
  });

  describe('POST /api/v1/pins (Create Pin)', () => {
    it('should create a new pin with title, image, and category (as tag)', async () => {
      const res = await request(app)
        .post('/api/v1/pins')
        .set('Authorization', `Bearer ${mainToken}`)
        .field('title', 'My First Awesome Pin From Test')
        .field('description', 'Detailed description of my first pin')
        .field('category', 'Photography Test')
        .attach('image_url', imageFixturePath);

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toBe('My First Awesome Pin From Test');
      expect(res.body.user.id).toBe(mainUser.id); 
      expect(res.body.tags).toBeInstanceOf(Array);
      if (res.body.tags.length > 0) {
        expect(res.body.tags[0].name).toBe('photography test');
      }
      const uploadedPinPath = path.join(process.cwd(), 'public', res.body.image_url);
      if (fs.existsSync(uploadedPinPath)) fs.unlinkSync(uploadedPinPath);
    });

    it('should return 400 if title is missing when creating a pin', async () => {
        const res = await request(app)
            .post('/api/v1/pins')
            .set('Authorization', `Bearer ${mainToken}`)
            .field('category', 'NoTitleCategory')
            .attach('image_url', imageFixturePath);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe('Title is required.');
    });

    it('should return 400 if image_url is missing when creating a pin', async () => {
        const res = await request(app)
            .post('/api/v1/pins')
            .set('Authorization', `Bearer ${mainToken}`)
            .field('title', 'No Image Pin')
            .field('category', 'NoImageCategory');
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe('Image file is required.');
    });
  });

  describe('GET /api/v1/pins (Get Pins List)', () => {
    let pinByMainUser, pinByOtherUser, tagForListArt, tagForListTech;
     beforeEach(async () => { 
        const [pin1IdResult] = await db('pins').insert({ title: 'List Art Pin', image_url: 'list_art.jpg', user_id: mainUser.id, created_at: new Date(Date.now() - 20000) });
        const pin1Id = pin1IdResult;
        const [pin2IdResult] = await db('pins').insert({ title: 'List Tech Pin', image_url: 'list_tech.jpg', user_id: otherUser.id, created_at: new Date(Date.now() - 10000) });
        const pin2Id = pin2IdResult;
        
        pinByMainUser = { id: pin1Id, title: 'List Art Pin' };
        pinByOtherUser = { id: pin2Id, title: 'List Tech Pin' };

        const [tagArtIdResult] = await db('tags').insert({ name: 'listartcategory' });
        const tagArtId = tagArtIdResult;
        const [tagTechIdResult] = await db('tags').insert({ name: 'listtechcategory' });
        const tagTechId = tagTechIdResult;
        
        tagForListArt = { id: tagArtId };
        tagForListTech = { id: tagTechId };

        await db('pin_tags').insert({ pin_id: pinByMainUser.id, tag_id: tagForListArt.id });
        await db('pin_tags').insert({ pin_id: pinByOtherUser.id, tag_id: tagForListTech.id });
    });

    it('should get a list of pins with user and tag info', async () => {
        const res = await request(app).get('/api/v1/pins').set('Authorization', `Bearer ${mainToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(2);
        const foundTechPin = res.body.data.find(p => p.title === 'List Tech Pin');
        expect(foundTechPin.user.username).toBe(otherUser.username);
    });

    it('should filter pins by category "listartcategory"', async () => {
        const res = await request(app).get('/api/v1/pins?category=listartcategory').set('Authorization', `Bearer ${mainToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].title).toBe('List Art Pin');
    });
  });
  
  describe('GET /api/v1/pins/:id (Get Pin Detail)', () => {
    let detailTestPinId; 
    beforeEach(async () => {
        const [pinIdResult] = await db('pins').insert({ title: 'Pin For Detail Test', description: 'A detailed pin.', image_url: 'detail_test.jpg', user_id: mainUser.id});
        detailTestPinId = pinIdResult;
        const [tagIdResult] = await db('tags').insert({name: 'pin-detail-tag'});
        const tagId = tagIdResult;
        await db('pin_tags').insert({pin_id: detailTestPinId, tag_id: tagId});
        await db('pin_likes').insert({pin_id: detailTestPinId, user_id: otherUser.id}); 
        await db('pin_comments').insert({pin_id: detailTestPinId, user_id: otherUser.id, text: 'Great pin for detail test!'});
    });

    it('should get full pin details, and is_liked should be true for the liking user', async () => {
        await db('pin_likes').insert({pin_id: detailTestPinId, user_id: mainUser.id}); 

        const res = await request(app)
            .get(`/api/v1/pins/${detailTestPinId}`)
            .set('Authorization', `Bearer ${mainToken}`); 
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toBe(detailTestPinId);
        expect(res.body.user.username).toBe(mainUser.username);
        expect(res.body.tags[0].name).toBe('pin-detail-tag');
        expect(res.body.like_count).toBe(2); 
        expect(res.body.is_liked).toBe(true); // Periksa ini
        expect(res.body.comments.length).toBe(1);
    });

    it('should get full pin details, and is_liked should be false if the user has not liked it', async () => {
        // Pastikan mainUser BELUM like pin ini di awal tes ini
        // (otherUser sudah like dari beforeEach)
        const res = await request(app)
            .get(`/api/v1/pins/${detailTestPinId}`)
            .set('Authorization', `Bearer ${mainToken}`); // Token dari mainUser
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toBe(detailTestPinId);
        expect(res.body.like_count).toBe(1); // Hanya otherUser yang like
        expect(res.body.is_liked).toBe(false); // Karena mainUser belum like
    });

    it('should return 404 if pin not found', async () => {
        const res = await request(app).get('/api/v1/pins/9999999').set('Authorization', `Bearer ${mainToken}`);
        expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /api/v1/pins/:pinId/like (Toggle Like)', () => {
    let pinToToggleLikeId;
     beforeEach(async() => {
        const [pinIdResult] = await db('pins').insert({ title: 'Like Toggle Pin Test', image_url: 'toggle.jpg', user_id: otherUser.id });
        pinToToggleLikeId = pinIdResult;
    });

    it('should like a pin and return new like status and count', async () => {
        const res = await request(app)
            .post(`/api/v1/pins/${pinToToggleLikeId}/like`)
            .set('Authorization', `Bearer ${mainToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.liked).toBe(true);
        expect(res.body.new_like_count).toBe(1);
    });

    it('should unlike an already liked pin', async () => {
        await request(app).post(`/api/v1/pins/${pinToToggleLikeId}/like`).set('Authorization', `Bearer ${mainToken}`); 
        const res = await request(app).post(`/api/v1/pins/${pinToToggleLikeId}/like`).set('Authorization', `Bearer ${mainToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.liked).toBe(false);
        expect(res.body.new_like_count).toBe(0);
    });
  });
  
  describe('POST /api/v1/pins/:pinId/comments (Add Comment)', () => {
    let pinToReceiveCommentId;
    beforeEach(async () => {
        const [pinIdResult] = await db('pins').insert({ title: 'Comment Target Pin Test', image_url: 'target.jpg', user_id: otherUser.id });
        pinToReceiveCommentId = pinIdResult;
    });
    it('should add a comment successfully', async () => {
        const res = await request(app)
            .post(`/api/v1/pins/${pinToReceiveCommentId}/comments`)
            .set('Authorization', `Bearer ${mainToken}`)
            .send({ text: 'This is a test comment from mainUser!' });
        expect(res.statusCode).toEqual(201);
        expect(res.body.text).toBe('This is a test comment from mainUser!');
        expect(res.body.user.id).toBe(mainUser.id);
    });

    it('should return 400 if comment text is empty', async () => {
        const res = await request(app)
            .post(`/api/v1/pins/${pinToReceiveCommentId}/comments`)
            .set('Authorization', `Bearer ${mainToken}`)
            .send({ text: ' ' }); // Teks kosong atau hanya spasi
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe('Comment text cannot be empty');
    });
  });

  describe('GET /api/v1/pins/search', () => {
    let pinTechIdForSearch;
    beforeEach(async () => {
        const [pinTechIdResult] = await db('pins').insert({ title: 'Advanced Technology Insights Pin', description: 'Exploring new tech for search.', image_url: 'search_tech.jpg', user_id: mainUser.id });
        pinTechIdForSearch = pinTechIdResult;
        await db('pins').insert({ title: 'Abstract Art Piece for Search', description: 'Modern art discussion search.', image_url: 'search_art.jpg', user_id: otherUser.id });
        const [tagIdResult] = await db('tags').insert({ name: 'searchtechnology' });
        const tagIdSearchTech = tagIdResult;
        await db('pin_tags').insert({ pin_id: pinTechIdForSearch, tag_id: tagIdSearchTech });
    });
    it('should find pins by title search query', async () => {
        const res = await request(app).get('/api/v1/pins/search?query=Advanced').set('Authorization', `Bearer ${mainToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].title).toContain('Advanced Technology');
    });
    it('should find pins by tag search query', async () => {
        const res = await request(app).get('/api/v1/pins/search?query=searchtechnology').set('Authorization', `Bearer ${mainToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        const pinWithTag = res.body.data.find(p => p.id === pinTechIdForSearch);
        expect(pinWithTag).toBeDefined();
        const hasTechTag = pinWithTag.tags.some(tag => tag.name === 'searchtechnology');
        expect(hasTechTag).toBe(true);
    });
     it('should return empty array if no pins match search query', async () => {
        const res = await request(app).get('/api/v1/pins/search?query=NonExistentQwerty').set('Authorization', `Bearer ${mainToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(0);
    });
  });
});