const express = require('express');
const app = express();
const session = require('express-session');

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const pgp = require('pg-promise')();
const path = require('path');

// Configure the database connection
const connectionString = 'postgres://postgres:123456@localhost:5432/mydatabase';
const db = pgp(connectionString);
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
    secret: 'secret-key',
    resave: false,  
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.json());

app.use(bodyParser.json());
// Set EJS as the view engine
app.set('view engine', 'ejs');


// Middleware to check if user is authenticated
async function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}
// Middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        // User is admin, allow access to the next middleware/route handler
        next();
    } else {
        // User is not admin, return unauthorized status
        res.status(403).json({ error: 'Access only for admins' });
    }
}


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.get('/admin.html',isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'admin.html'));
});


app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'login.html'));
});

app.get('/profile.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'profile.html'));
});


app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));

});

app.get('/GoogleMaps.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'GoogleMaps.html'));

});


// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email);

        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send('Invalid email or password');
        }

        // Set the user object in the session
        req.session.user = user;

        // Log the user object
        console.log('User logged in:', user);

        // Redirect to the index page
        res.redirect('/index');

    } catch (error) {
        console.error('Error during login:', error);
        next(error);
    }
});

app.post('/update-profile', isAuthenticated, async (req, res) => {
    const { action, name, email, password, note } = req.body;
    const userId = req.session.user.id;

    console.log('Request Body:', req.body); // Log the request body

    try {
        switch (action) {
            case 'changeName':
                await db.none('UPDATE users SET username = $1 WHERE id = $2', [name, userId]);
                break;
            case 'changeEmail':
                await db.none('UPDATE users SET email = $1 WHERE id = $2', [email, userId]);
                break;
            case 'changePassword':
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.none('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
                break;
            case 'changeNote':
                await db.none('UPDATE users SET note = $1 WHERE id = $2', [note, userId]);
                break;
            default:
                break;
        }

        // Fetch updated user info
        const updatedUserInfo = await db.one('SELECT * FROM users WHERE id = $1', userId);
        res.json(updatedUserInfo);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





// Get user information
app.get('/user-info', async (req, res) => {
    const userId = req.session.user.id;
    try {
        const user = await db.one('SELECT * FROM users WHERE id = $1', userId);
        res.json({
            username: user.username,
            email: user.email,
            note: user.note // Include the note field
        });
    } catch (error) {
        console.error('Error fetching user information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Register a new user
app.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await db.one(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, email, hashedPassword, role]
        );
        res.status(201).json(result);
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Error during registration');
    }
});

// Update user note
app.post('/update-note', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id;
    const { note } = req.body;

    try {
        await db.none('UPDATE users SET note = $1 WHERE id = $2', [note, userId]);
        res.status(200).json({ message: 'Note updated successfully' });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user note
app.get('/user-note', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id;

    try {
        const user = await db.one('SELECT note FROM users WHERE id = $1', userId);
        res.status(200).json({ note: user.note });
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/posts', async (req, res) => {
    const { title, content } = req.body;
    const userId = req.session.user.id;

    try {
        // Fetch the username from the database using the userId
        const user = await db.one('SELECT username FROM users WHERE id = $1', userId);
        const author = user.username;

        const newPost = await db.one('INSERT INTO posts(title, content, author) VALUES($1, $2, $3) RETURNING *', [title, content, author]);
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const posts = await db.any('SELECT id, title, content, author, created_at FROM posts ORDER BY created_at DESC');
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a post
app.delete('/api/posts/:postId', async (req, res) => {
    const postId = req.params.postId;

    try {
        await db.none('DELETE FROM posts WHERE id = $1', postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Edit a post
app.put('/api/posts/:postId', async (req, res) => {
    const postId = req.params.postId;
    const { title, content } = req.body;

    try {
        await db.none('UPDATE posts SET title = $1, content = $2 WHERE id = $3', [title, content, postId]);
        res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/user-role', (req, res) => {
    const userRole = req.session.user.role || 'user'; // Default to 'user' if role is not set
    res.json({ role: userRole });
});


// Edit post route
app.get('/edit-post.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'edit-post.html'));
});

app.get('/location', (req, res) => {
    const locationFilePath = path.join(__dirname, 'location.json');

    fs.readFile(locationFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading location.json:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        try {
            const locationData = JSON.parse(data);

            // Respond with the dynamic latitude and longitude
            res.json(locationData);
        } catch (parseError) {
            console.error('Error parsing location.json:', parseError);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.redirect('/login'); // Redirect to the login page after logout
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));

});


// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
