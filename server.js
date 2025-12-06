const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret_key_here'; // In production, use environment variable
const ADMIN_CODE = process.env.ADMIN_CODE || 'SECRET_ADMIN_CODE';
const path = require('path');

// Middleware
// Allow requests from any origin for this simple demo (adjust in production)
app.use(cors());
app.use(express.json());

// Serve static files (index.html, admin.html, client assets)
app.use(express.static(__dirname));

// Simple token verification middleware
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

// MongoDB Connection
// Replace with your actual connection string if different
const MONGO_URI = 'mongodb://localhost:27017/lumina_ecommerce';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    action: { type: String, required: true }, // 'REGISTER', 'LOGIN'
    timestamp: { type: Date, default: Date.now }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// Helper to log activity
async function logActivity(user, action) {
    try {
        await ActivityLog.create({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            action
        });
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
}

// Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, adminCode } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine role
        const role = (adminCode && adminCode === ADMIN_CODE) ? 'admin' : 'user';

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        // Log Activity
        await logActivity(newUser, 'REGISTER');

        // Generate Token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin-only: list users (no passwords)
app.get('/api/users', verifyToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin-only: list activity logs
app.get('/api/activity', verifyToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
        res.json({ logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Serve admin page (client-side auth will handle protection)
app.get('/admin', async (req, res) => {
    try {
        return res.sendFile(path.join(__dirname, 'admin.html'));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Log Activity
        await logActivity(user, 'LOGIN');

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
