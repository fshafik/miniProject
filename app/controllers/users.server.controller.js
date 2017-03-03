var mongoose = require('mongoose');
var Student = mongoose.model('Student');
var passport = require('passport');

exports.create = function(req, res, next) {

    var student = new Student(req.body);
    var message = null;
    student.provider = 'local';
    student.save(function(err) {
        if (err) {
          var message = getErrorMessage(err);
          req.flash('error', message);
          return res.render('register', {messages:message});
        }
        req.login(student, function(err) {
                if (err)
                {
                  return next(err);
                }
                else
                {
                  return res.redirect('/');
                }

            });
    });

};

var getErrorMessage = function(err) {
    var message = '';
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Username already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    }
    else {
        for (var errName in err.errors) {
            if (err.errors[errName].message){
              message = err.errors[errName].message;
            }

        }
    }

    return message;
};

exports.renderLogin = function(req, res, next) {
    if (!req.user) {
        res.render('login',
            {messages: req.flash('error') || req.flash('info')});
    }
    else {
        return res.redirect('/');
    }
};

exports.register = function(req,res){
    res.render('register');
};


exports.homepage = function(req, res, next)
{
    var loggedIn;

    if(req.user)
      loggedIn = 1;
    else
      loggedIn = 0;

      Student.find({}, function(err, students) {

          if (err) {
              return next(err);
          }
          else {

            var studentsWithWork = [];

            for(var i = 0; i < students.length; i++)
            {
              if(students[i].links.title){

                studentsWithWork.push(students[i]);


              }
            }
            console.log("student with work is readyyy");
              var pageSize = 10,
                  pageCount = Math.ceil((studentsWithWork.length)/pageSize),
                  currentPage = 1,
                  studentsArrays = [],
                  studentsList = [];

              console.log("initialized variables");
              //split list into groups
              while (studentsWithWork.length > 0) {
                  studentsArrays.push(studentsWithWork.splice(0, pageSize));
              }
              console.log("finished first loop");
              //set current page if specifed as get variable (eg: /?page=2)
              if (typeof req.query.page !== 'undefined') {
                  currentPage = +req.query.page;
                  home = 1;
              }
              console.log("finished if condition");

              //show list of students from group
              studentsList = studentsArrays[+currentPage - 1];
`             console.log("ANA HENAAAA");`

              res.render('homepage', {
                  students: studentsList,
                  pageSize: pageSize,
                  pageCount: pageCount,
                  currentPage: currentPage,
                  loggedIn:loggedIn
              });



          }
      });


}

exports.list = function(req, res, next) {
    Student.find({}, function(err, students) {

        if (err) {
            return next(err);
        }
        else {
          console.log(students);
            res.render('showall',{students:students});
        }
    });

};

exports.read = function(req, res) {
    res.json(req.user);
};

exports.userByID = function(req, res, next, id) {
    Student.findOne({
            _id: id
        },
        function(err, user) {
            if (err) {
                return next(err);
            }
            else {
                req.user = user;
                next();
            }
        }
    );
};

exports.update = function(req, res, next) {
    Student.findByIdAndUpdate(req.user.id, req.body, function(err, user) {
        if (err) {
            return next(err);
        }
        else {
            res.json(user);
        }
    });
};

exports.delete = function(req, res, next) {
    req.user.remove(function(err) {
        if (err) {
            return next(err);
        }
        else {
            res.json(req.user);
        }
    })
};

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};

exports.insertWorks = function(req,res){
    if(!req.user)
      res.send("This must be an error. Kindly sign in to insert work");
    else {

      var title = req.body.title;

      if(req.body.url1){
        var url = req.body.url1;
        Student.findByIdAndUpdate(req.user.id, {$push:{"links.title": title,"links.url":url, "links.photo":null }}, function(err, doc) {
        console.log(doc);
        });
     }
      else {
        console.log(req.file);
          var photo = req.file.filename;
          Student.findByIdAndUpdate(req.user.id, {$push:{"links.title": title,"links.photo":photo, "links.url": null}}, function(err, doc) {
          console.log(doc);
          });
        }

    //  db.blogs.update({id:"001"}, {$push:{comments:{title:"commentX",content:".."}}});
      res.redirect("/");

      }
}

exports.addWork = function(req,res){
  if(!req.user)
    res.send("Must be logged in to add work");
  else {
    res.render("addWork");
  }
}
//unchecked
exports.getWorks = function(req, res,next)
{
  Student.findOne({_id: req.user.id},
      function(err, user) {
          if (err) {
              return next(err);
          }
          else {
            console.log(user.links);
              res.render('portfolio', {links:user.links});
          }
      }
  );
};
//unchecked
exports.getProfile = function(req,res){


    Student.findOne({_id: req.user.id},
        function(err, user) {
            if (err) {
                return next(err);
            }
            else {
              if(req.user){
                console.log("BODY: " + req.body);
                var description = req.body.description;
                if(req.user.links.title)
                {

                  var photos = user.links.photo.split(',');
                  console.log(photos);
                  var urls = user.links.url.split(',');
                  console.log(urls);
                  var titles = user.links.title.split(',');
                  res.render('profile', {pic:req.user.photo, description:description,user:user, photos:photos, urls:urls, titles:titles});
                }
                else {
                  res.render('profile', {pic:req.user.photo, user:user, photos:null, urls:null, titles:null,description:description });
                }
              }
                else {
                  res.send("you aint signed in brotha");
                }
            }}
    );


}


exports.uploadProfilePic = function(req,res){
  res.render('profilepic');
}


exports.addProfilePic = function(req,res){

  Student.findByIdAndUpdate(req.user.id, {photo:req.file.filename}, function(err, user){//check if filename cause problem
      console.log("user");



  });//change this
  if(req.user.links.title)
  {
      var photos = req.user.links.photo.split(',');
    console.log(photos);
    var urls = req.user.links.url.split(',');
    console.log(urls);
    var titles = req.user.links.title.split(',');
    res.render('profile', {pic:req.user.photo, user:req.user, photos:photos, urls:urls, titles:titles});
  }
  else {
    res.render('profile', {pic:req.user.photo, user:req.user, photos:null, urls:null,titles:null});
  }

}



exports.addDescription = function(req,res){
  res.render('description');
}


exports.insertDescription = function(req,res){
  console.log(req.user);
  Student.findByIdAndUpdate(req.user.id, {description:req.body.description}, function(err, user){//check if filename cause problem
      console.log("user");
  });//change this
        if(req.user.links.title)
        {
            var photos = req.user.links.photo.split(',');
          console.log(photos);
          var urls = req.user.links.url.split(',');
          console.log(urls);
          var titles = req.user.links.title.split(',');
          res.render('profile', {pic:req.user.photo, user:req.user, photos:photos, urls:urls, titles:titles});
        }
        else {
          res.render('profile', {pic:req.user.photo, user:req.user, photos:null, urls:null,titles:null});
        }

}
