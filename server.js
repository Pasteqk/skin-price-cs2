require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = 5000;

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fetch skin data from CSFloat API
app.get('/scrape-skin', async (req, res) => {
    const listingID = req.query.id;
    if (!listingID) {
        return res.status(400).json({ error: 'No listing ID provided' });
    }

    try {
        const { data } = await axios.get(`https://csfloat.com/api/v1/listings/${listingID}`, {
            headers: {
                'Authorization': `Bearer ${process.env.CSFLOAT_API_KEY}`
            }
        });

        // Check if the API response contains the skin data
        if (!data || !data.item) {
            return res.status(404).json({ error: 'Skin data not found for this listing ID' });
        }

        const item = data.item;
        const skinData = {
            listing_id: listingID,
            name: `${item.item_name} | ${item.wear_name}`, // Full name with wear (before truncation)
            wear: item.wear_name,
            float: item.float_value,
            pattern: item.paint_seed,
            price: data.price, // Price in cents
            min_offer_price: data.min_offer_price, // Minimum offer price
            image_url: `https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}`, // Construct the full image URL
            inspect_link: item.inspect_link // Inspect link
        };

        // Truncate the skin name to remove the wear part
        const truncatedName = skinData.name.split(' | ')[0] + ' | ' + skinData.name.split(' | ')[1];

        // Update the skinData with truncated name before saving
        skinData.name = truncatedName;

        res.json(skinData); // Send the data back to the frontend
    } catch (error) {
        console.error('Error fetching skin from CSFloat:', error);
        res.status(500).json({ error: 'Error fetching skin data from CSFloat' });
    }
});

// Save skin data to PostgreSQL (Updated without "weapon" column)
app.post('/add-skin', async (req, res) => {
    const { listing_id, name, wear, float, pattern, price, min_offer_price, image_url, inspect_link } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO skins (listing_id, name, wear, float, pattern, price, min_offer_price, image_url, inspect_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [listing_id, name, wear, float, pattern, price, min_offer_price, image_url, inspect_link]
        );

        res.json(result.rows[0]); // Respond with the saved skin data
    } catch (error) {
        console.error('Error saving skin to database:', error);
        res.status(500).json({ error: 'Error saving skin to database' });
    }
});

// Get all saved skins
app.get('/get-skins', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM skins');
        res.json(result.rows); // Send the skins from the database to the frontend
    } catch (error) {
        console.error('Error fetching skins from database:', error);
        res.status(500).json({ error: 'Error fetching skins from database' });
    }
});

// Delete a skin from the database
app.delete('/delete-skin/:id', async (req, res) => {
    const skinId = req.params.id;
    try {
        const result = await pool.query('DELETE FROM skins WHERE id = $1 RETURNING *', [skinId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Skin not found' });
        }
        res.json({ message: 'Skin deleted successfully' });
    } catch (error) {
        console.error('Error deleting skin:', error);
        res.status(500).json({ error: 'Error deleting skin' });
    }
});

// Edit the skin's price in the database
app.put('/edit-skin/:id', async (req, res) => {
    const skinId = req.params.id;
    const { price } = req.body;

    try {
        const result = await pool.query(
            'UPDATE skins SET price = $1 WHERE id = $2 RETURNING *',
            [price, skinId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Skin not found' });
        }
        res.json(result.rows[0]); // Return the updated skin
    } catch (error) {
        console.error('Error editing skin:', error);
        res.status(500).json({ error: 'Error editing skin' });
    }
});

// Serve the frontend app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
