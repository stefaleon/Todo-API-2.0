const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  email: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      unique: true,
      validate: {
          validator: validator.isEmail,
          message: '{VALUE} is not a valid email'
          }
  },
  password: {
      type: String,
      required: true,
      minlength: 4
  },
  tokens: [{
      access: {
          type: String,
          required: true
      },
      token: {
          type: String,
          required: true
      }
  }]
});


// override toJSON method so that tokens are not displayed to user
// now JSON object will contain only the _id and email properties
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return {
         _id: userObject._id,
         email: userObject.email
    }
};

// generate token instance method
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id, access}, 'this is my salt').toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

// find by token model method
UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'this is my salt')
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

var User = mongoose.model('User', UserSchema);

module.exports = {User}
