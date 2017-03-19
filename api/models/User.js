/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt');
var noop = function(){};

module.exports = {
  schema: true,

  attributes: {
    id: {
      type: 'string',
      required: 'true',
      unique: true
    },

    encryptedPassword: {
      type: 'string'
    },

    admin: {
      type: 'boolean'
    },

    friends: {
      type: 'array'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.encryptedPassword;
      return obj;
    }
  },

  //encrypt password before creating an user
  beforeCreate: (request, callback) => {
    let rq = request || {},
        cb = callback || {};
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return cb(err);
      bcrypt.hash(rq.password, salt, (err,hash) => {
        if (err) return cb(err);
        rq.encryptedPassword = hash;
        cb();
      });
    });
  },

  comparePassword: (password, user, callback) => {
    let cb = callback || {};
    bcrypt.compare(password, user.encryptedPassword, (err,match) => {
      if (err) cb(err);
      if (match) {
        cb(null,true);
      } else {
        cb(err);
      }
    });
  },

  addFriend: (request, callback) => {
    var req = request || {},
        cb = callback || noop,
        workflow = new (require('events').EventEmitter)();

    workflow.on('firstAdd', () => {
        User.findOne({id: req.id}).exec( (err, user) => {
        let friends = user.friends ? user.friends : [];
        for(let i=0;i<friends.length;i++){
          if (friends[i] === req.friendID) {
            return cb(null,{message: 'This user has been your friend'});
          }
        }
        friends.push(req.friendID);
        User.update({id: req.id}, {friends: friends}).exec( (err, updatedUser) => {
          if (err) return cb(err);
        });

        workflow.emit('secondAdd');
      });
    });

    workflow.on('secondAdd',() => {
      User.findOne({id: req.friendID}).exec( (err, user) => {
        let friends = user.friends ? user.friends : [];
        friends.push(req.id);
        User.update({id: req.friendID}, {friends: friends}).exec( (err, updatedUser) => {
          if (err) return cb(err);
          return cb(null,{message: 'Add succesfully'});
        });
      });
    });   

    workflow.emit('firstAdd');
  }
  //beforeUpdate: ()

}

