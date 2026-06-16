const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../database');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const setTokenCookie = (res, token) => {
  const isSecure = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { sub, name, email, picture } = ticket.getPayload();

    let user = await db.users.findOne({ email });
    if (!user) {
      user = await db.users.create({
        googleId: sub,
        name,
        email,
        avatar: picture
      });
    } else if (!user.googleId) {
      await db.users.update({ _id: user._id }, { googleId: sub, avatar: picture });
      user = { ...user, googleId: sub, avatar: picture };
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses || []
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Google authentication failed', error: error.message });
  }
};

exports.devLogin = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.users.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        avatar: user.avatar, role: user.role, phone: user.phone,
        addresses: user.addresses || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await db.users.findById(req.user._id);
  res.json(user);
};

exports.logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;
    const update = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (addresses) update.addresses = addresses;
    await db.users.update({ _id: req.user._id }, update);
    const user = await db.users.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
