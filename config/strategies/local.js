var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Student = require('mongoose').model('Student');

module.exports = function() {
    passport.use(new LocalStrategy(function(username, password, done) {

       Student.findOne(
            {username: username},
            function(err, user) {
                if (err) {

                    return done(err);
                }

                if (!user) {
                    return done(null, false, {message: 'Unknown user'});
                }

                if (!user.authenticate(password)) {
                    return done(null, false, {message: 'Invalid password'});
                }
                
                return done(null, user);
            }
        );
    }));
};
