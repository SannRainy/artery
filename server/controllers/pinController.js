const knex = require('../knex');

exports.createPin = async (req, res) => {
  try {
    console.log('REQ FILE:', req.file);
    console.log('REQ BODY:', req.body);
    console.log('REQ USER:', req.user);

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { title, description, tags } = req.body;

    const newPin = {
      title,
      description,
      tags: JSON.parse(tags || '[]'),  
      image_url: `/uploads/${req.file.filename}`,  
      user_id: req.user.id, 
      created_at: new Date()
    };


    const savedPin = await Pin.create(newPin);

    return res.status(201).json(savedPin);
  } catch (err) {
    console.error('CREATE PIN ERROR:', err);
    return res.status(500).json({ error: 'Gagal menyimpan pin di server' });
  }
};

exports.getRandomPinTitles = async (req, res) => {
  try {

    const randomPins = await knex('pins')
      .select('id', 'title') 
  .orderByRaw('RAND()')
      .limit(5);

    res.json(randomPins);
  } catch (error) {
    console.error('Error fetching random pin titles:', error);
    res.status(500).json({ message: 'Server error saat mengambil judul acak' });
  }
};
