import mongoose from 'mongoose';

const collection = 'Users'; 

const documentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    reference: { type: String, required: true }
}, { _id: false }); 

const schema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'premium'], 
        default: 'user'
    },
    documents: {
        type: [documentSchema], 
        default: []
    },
    last_connection: {
        type: Date,
        default: null
    },
    pets: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Pets'
        }
    ]
}, { timestamps: true }); 

const userModel = mongoose.model(collection, schema);

export default userModel;