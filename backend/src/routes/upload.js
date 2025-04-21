const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
    const user = supabase.auth.user(); // Get the currently authenticated user

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the file from the request
    const file = req.file;
    const fileName = `${user.id}/profile-picture.png`; // Use user ID to create a unique file name

    // Upload the file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true, // Overwrite if the file already exists
        });

    if (uploadError) {
        return res.status(400).json({ error: uploadError.message });
    }

    // Get the public URL of the uploaded image
    const { publicURL, error: urlError } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

    if (urlError) {
        return res.status(400).json({ error: urlError.message });
    }

    // Update the user's profile with the new profile picture URL
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicURL }) // Assuming 'avatar_url' is the column for the profile picture
        .eq('id', user.id);

    if (profileError) {
        return res.status(400).json({ error: profileError.message });
    }

    // Respond with success
    res.status(200).json({ message: 'Profile picture uploaded successfully!', url: publicURL });
});

module.exports = router; 
