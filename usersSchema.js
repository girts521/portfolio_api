const mongoose = require('mongoose');


const users = new mongoose.Schema({
    name: String,
    email: String
  });