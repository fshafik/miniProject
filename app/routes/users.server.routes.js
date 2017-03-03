

var users = require('../../app/controllers/users.server.controller');

module.exports = function(app,passport,multer) {
    app.route('/register').post(users.create).get(users.register);
    app.route('/students/studentSignIn').get(users.renderLogin)
    .post(passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/students/studentSignIn',
            failureFlash: true
        }));

    app.route('/students/:studentId').get(users.read).put(users.update).delete(users.delete);
    app.route('/').get(users.homepage);
    app.get('/logout', users.logout);
    app.param('studentId', users.userByID);

    app.post('/uploadfiles', multer({ dest: './uploads/'}).single('upl'),
    function(req,res){
      console.log(req.body);
      console.log(req.file);
      res.status(204).end();
    });

    app.get('/uploadfiles', function(req,res){
      res.render('uploadfile');
    });

    app.route('/getWork').get(users.getWorks);
  //  app.route(/insertWork/).get(users.insertWorks);
    app.post(/insertWork/, multer({ dest: './uploads/'}).single('upl'), users.insertWorks);
    app.route('/addWork').get(users.addWork);

    app.get('/profile', users.getProfile);
    app.post('/profile', multer({ dest: './uploads/'}).single('upl'), users.addProfilePic);
    app.get('/description', users.addDescription);
    app.post('/description', users.insertDescription);
    app.get('/profilepic', users.uploadProfilePic);



    //app.route('/studentportfolio/:studentId').get(users.portfolio);
};
