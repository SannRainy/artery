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
      tags: JSON.parse(tags || '[]'),  // handle JSON
      image_url: `/uploads/${req.file.filename}`,  // assuming static path
      user_id: req.user.id, // dari JWT
      created_at: new Date()
    };

    // Simpan ke database (contoh pakai Prisma atau ORM kamu)
    const savedPin = await Pin.create(newPin); // sesuaikan dengan ORM kamu

    return res.status(201).json(savedPin);
  } catch (err) {
    console.error('CREATE PIN ERROR:', err);
    return res.status(500).json({ error: 'Gagal menyimpan pin di server' });
  }
};
