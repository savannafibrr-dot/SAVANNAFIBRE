const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');
const aboutRouter = require('../routes/about');

const app = express();

// Connect to MongoDB with retry logic
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
            w: 'majority'
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

connectDB();

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'local-development-secret',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

// Add CORS configuration
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://savannafibre.co.tz',
        'https://www.savannafibre.co.tz'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));
app.use('/banner-uploads', express.static(path.join(__dirname, '../public/banner-uploads')));

// Set view engine
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    res.locals.env = {
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
    };
    next();
});

// Passport Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/plans', require('../routes/plans'));
app.use('/api/shops', require('../routes/shops'));
app.use('/api/coverage', require('../routes/coverage'));
app.use('/api/banners', require('../routes/banners'));
app.use('/api/users', require('../routes/users'));
app.use('/api/about', aboutRouter);
app.use('/api/payments', require('../routes/payments'));
app.use('/api/faqs', require('../routes/faqs'));
app.use('/api/accessories', require('../routes/accessories'));
app.use('/api/settings', require('../routes/settings'));
app.use('/', require('../routes/mail'));
app.use('/about-uploads', express.static(path.join(__dirname, '../public/about-uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Serve static files from the public directory for admin routes
app.use('/admin', auth, express.static(path.join(__dirname, '../public')));

// Handle admin routes with authentication
app.get('/admin/', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/admin/dashboard', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/admin/plans', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/plans.html'));
});

app.get('/admin/shop', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/shop.html'));
});

app.get('/admin/coverages', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/coverages.html'));
});

app.get('/admin/coverage', auth, (req, res) => {
    res.redirect('/admin/coverages');
});

app.get('/admin/users', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/users.html'));
});

app.get('/banners', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/banners.html'));
});

app.get('/admin/accessories', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/accessories.html'));
});

// Serve all frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle frontend routes
app.get('/shops', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/shops.html'));
});

app.get('/coverage', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/coverage.html'));
});

app.get('/accessories', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/accessories.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/contact.html'));
});

app.get('/policy', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/policy.html'));
});

app.get('/payments', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/payments.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/faq.html'));
});

app.get('/residential', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/residential.html'));
});

app.get('/business', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/business.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Export for Vercel
module.exports = app;
