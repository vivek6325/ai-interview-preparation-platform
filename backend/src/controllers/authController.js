import mongoose from 'mongoose';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { readUsersFromFile, writeUsersToFile } from '../utils/fileStore.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, avatar } = req.body;

    // 1. Inputs validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Full name is required.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email address is required.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Fallback: If DB is offline, store in local JSON file store
    if (mongoose.connection.readyState !== 1) {
      const usersList = readUsersFromFile();
      const existing = usersList.find((u) => u.email && u.email.toLowerCase() === cleanEmail);

      if (existing) {
        return res.status(400).json({
          status: 'fail',
          message: 'A user with this email address already exists.',
        });
      }

      const newUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        fullName: fullName.trim(),
        email: cleanEmail,
        password,
        avatar: avatar || '',
        role: 'candidate',
        createdAt: new Date().toISOString()
      };

      usersList.push(newUser);
      writeUsersToFile(usersList);

      const token = generateToken(newUser._id);
      return res.status(201).json({
        status: 'success',
        token,
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          avatar: newUser.avatar,
          role: newUser.role,
        },
      });
    }

    // 2. Email uniqueness check
    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'A user with this email address already exists.',
      });
    }

    // 3. Create new user document (password hashing triggered by pre-save schema hook)
    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      password,
      avatar: avatar || '',
    });

    if (user) {
      // 4. Generate JWT
      const token = generateToken(user._id);

      res.status(201).json({
        status: 'success',
        token,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid user registration parameters.',
      });
    }
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'An unexpected error occurred during registration.',
    });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Inputs validation
    if (!email || !email.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email address.',
      });
    }

    if (!password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Fallback: If DB is offline, check local JSON file store
    if (mongoose.connection.readyState !== 1) {
      const usersList = readUsersFromFile();
      let existingUser = usersList.find((u) => u.email && u.email.toLowerCase() === cleanEmail);

      if (!existingUser) {
        // Auto-create candidate on first demo login if not existing
        existingUser = {
          _id: new mongoose.Types.ObjectId().toString(),
          fullName: cleanEmail.split('@')[0] || 'Demo Candidate',
          email: cleanEmail,
          password,
          avatar: '',
          role: 'candidate',
          createdAt: new Date().toISOString()
        };
        usersList.push(existingUser);
        writeUsersToFile(usersList);
      }

      const token = generateToken(existingUser._id);
      return res.status(200).json({
        status: 'success',
        token,
        user: {
          _id: existingUser._id,
          fullName: existingUser.fullName,
          email: existingUser.email,
          avatar: existingUser.avatar,
          role: existingUser.role,
        },
      });
    }

    // 2. Locate user in DB
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.',
      });
    }

    // 3. Match passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.',
      });
    }

    // 4. Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'An unexpected error occurred during login.',
    });
  }
};
