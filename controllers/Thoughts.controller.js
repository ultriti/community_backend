const thoughtsModel = require('../models/thoughts.model.js');
const thoghtsServices = require('../services/Thoughts.service.js')

module.exports.createThoughts = async (req, res) => {
    try {
   
        
        const thoughts_msg = req.body.thoughts;
        const userId = req.id;
        if (!thoughts_msg) {
            return res.status(400).json({ errors: [{ msg: 'thought is required' }] });
        }
        const thoughtData = await thoghtsServices.create_thoughts({
            userId, 
            thought : thoughts_msg,
            
        })

        res.status(200).json({ msg: 'thought created successfully', thoughtData });

    }catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server Error' });
    }
}

module.exports.getallThouhghts = async (req, res) => {
    try {
        const thoughts_data = await thoughtsModel.find({}).populate('author','Username profilePic');
        
        res.status(200).json({ msg: 'all thoughts fetched successfully', thoughts_data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}