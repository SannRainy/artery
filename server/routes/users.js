// server/routes/user.js
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Middleware autentikasi
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' })

  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' })
    req.user = user
    next()
  })
}

export default function (db) {
  // REGISTER
  router.post('/register', async (req, res) => {
    const { username, email, password } = req.body

    const existingUser = await db('users')
      .where({ email })
      .orWhere({ username })
      .first()

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [user] = await db('users')
      .insert({
        username,
        email,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning(['id', 'username', 'email'])

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ user, token })
  })

  // LOGIN
  router.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await db('users').where({ email }).first()
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ user, token })
  })

  // GET CURRENT USER
  router.get('/me', authenticate, async (req, res) => {
    const user = await db('users').where({ id: req.user.id }).first()
    res.json(user)
  })

  return router
}
