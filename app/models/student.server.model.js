var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;


//make student here
var StudentSchema = new Schema({
    name: String,
    username: {
          type: String,
          trim: true,
          unique: true
      },
    description: String,
    password: String,
    uni_id: String,
    photo :{type:String,default:"default.jpg"},
    provider: String,
    providerId: String,
    providerData: {},
    links: {
        title:String,
        photo: String,
        url: String,
  }
});



StudentSchema.pre('save',
    function(next) {
        if (this.password) {
            var md5 = crypto.createHash('md5');
            this.password = md5.update(this.password).digest('hex');
        }

        next();
    }
);

StudentSchema.methods.authenticate = function(password) {
    var md5 = crypto.createHash('md5');
    md5 = md5.update(password).digest('hex');
    return this.password === md5;
};


StudentSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne(
        {username: possibleUsername},
        function(err, user) {
            if (!err) {
                if (!user) {
                    callback(possibleUsername);
                }
                else {
                    return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
                }
            }
            else {
                callback(null);
            }
        }
    );
};

mongoose.model('Student', StudentSchema);
