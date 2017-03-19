
module.exports = {
    login: (req, res) => {
        if (!req.body.id || !req.body.password){
            return res.json(401, {error: 'id and password required'})
        }

        User.findOne({id: req.body.id}, (err, user) => {
            if (!user) {
                return res.json(401, {error: 'Id does not exist'});
            }

            User.comparePassword(req.body.password, user, (err, valid) => {
                if (err) {
                    return res.json(403, {error: 'forbiden'});
                }
                if (!valid) {
                    return res.json(401, {error: 'invalid password'});
                } else {
                    res.json({
                        user: user,
                        token: jwToken.token({id: user.id, admin: user.admin })
                    });
                }
            })
        });
    }
}