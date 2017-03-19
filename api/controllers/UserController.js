/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	createUser: (req, res) => {
        if (req.body.password !== req.body.confirmPassword){
            return res.json(401, {error: 'Password doesn\'t match'});
        }
        User.create(req.body).exec((err, user) => {
            if (err) {
                return res.json(err.status, {error: err});
            }
            // If user created successfuly we return user and token as response
            if (user) {
                res.json(200, {
                    user: user, 
                    token: jwToken.token({id: user.id, admin: user.admin })
                });
            }
        });
    },

    listUser: (req, res) => {
        if (req.decoded.admin) {
            User.find({}).exec( (err, users) => {
                res.json({
                    result: users && !err ? users : null,
                    error: err ? err : null
                });
            });
        } else res.json({message: "you are not admin"});
    },

    addFriend: (req, res) => {
        if (!req.decoded.admin) {
            var request = {
                id: req.decoded.id,
                friendID: req.body.friendID
            };
    
            User.addFriend(request, (err, response) => {
                res.json({ 
                    result: response && !err ? response : null,
                    error: err ? err : null
                });
            });
        } else res.json({message: "Admin cannot add friend"});
    },

    deleteUser: (req, res) => {
        if (req.decoded.admin){
            User.destroy({id: req.body.id}).exec( (err) =>{
                if (err) {
                    return res.json(err.status, {error: err});
                } else res.json({message: 'delete successfully'});
            });
        } else res.json({message: 'You are not admin'});
    },

    purchaseHistory: (req, res) => {
        if (!req.decoded.admin){
            Ticket.find({user: req.decoded.id}).exec( (err, tickets) => {
                if (err) {
                    return res.json(err.status, {error: err});
                } else {
                    res.json({ 
                    boughtTicket: tickets,
                    error: null
                });
                }
            });
        } else res.json({message: 'Admin cannot buy ticket'});
    }
};

