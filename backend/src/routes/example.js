const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Example route to fetch data from Supabase
router.get('/data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('your_table')
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Example route to insert data into Supabase
router.post('/data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('your_table')
      .insert([req.body]);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 