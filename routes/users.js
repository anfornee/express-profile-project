var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');

//////////* GET USERS LISTING FOR ADMIN *///////////
router.get('/admin', authService.verifyUser, function (req, res, next) {
  if (req.user.Admin) {
    models.users.findAll({
      where: {
        Deleted: false
      }
    })
      .then(usersFound => {
        res.render('adminProfile', {
          FirstName: req.user.FirstName,
          LastName: req.user.LastName,
          Email: req.user.Email,
          UserId: req.user.UserId,
          Username: req.user.Username,
          Admin: req.user.Admin,
          Deleted: req.user.Deleted,
          users: usersFound
        });
      });
  } else {
    res.redirect('/users/unauthorized');
  }
});

router.get('/unauthorized', function (req, res, next) {
  res.render('unauthorized');
});

//////////* SIGN UP */////////
router.get('/signup', function (req, res, next) {
  res.render('signup');
});

router.post('/signup', function (req, res, next) {
  models.users.findOrCreate({
    where: {
      Username: req.body.username
    },
    defaults: {
      FirstName: req.body.firstName,
      LastName: req.body.lastName,
      Email: req.body.email,
      Password: authService.hashPassword(req.body.password)
    }
  })
    .spread(function (result, created) {
      if (created) {
        res.redirect('/users/login');
      } else {
        res.send('This user already exists');
      }
    });
});

/////////* LOGIN *///////////
router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  models.users.findOne({
    where: {
      Username: req.body.userName
    }
  })
    .then(user => {
      if (!user) {
        console.log('User not found');
        return res.status(401).json({ message: 'Login failed' });
      } else {
        let passwordMatch = authService.comparePasswords(req.body.password, user.Password);
        if (passwordMatch) {
          let userId = user.UserId
          let token = authService.signUser(user);
          let admin = user.Admin
          res.cookie('jwt', token);
          if (admin === true) {
            res.redirect('admin');
          } else {
            res.redirect('profile/' + userId);
          }
        } else {
          res.send('Incorrect password');
        }
      }
    })
});

/////////* LOGOUT *//////////
router.get('/logout', function (req, res, next) {
  res.cookie('jwt', null, { expires: new Date(0) });
  res.redirect('login');
});

////////* USER PROFILE */////////
router.get('/profile/:id', authService.verifyUser, function (req, res, next) {
  let userId = parseInt(req.params.id);
  if (req.params.id !== String(req.user.UserId)) {
    res.redirect('/users/unauthorized');
  } else {
    models.posts.findAll({
      where: {
        userId: userId,
        Deleted: false
      }
    })
      .then(postsFound => {
        res.render('profile', {
          FirstName: req.user.FirstName,
          LastName: req.user.LastName,
          Email: req.user.Email,
          UserId: req.user.UserId,
          Username: req.user.Username,
          Admin: req.user.Admin,
          Deleted: req.user.Deleted,
          posts: postsFound
        })
      });
  }
});

/////////* USER POST FORM *//////////
router.post('/profile/:id/post', function (req, res, next) {
  let userId = parseInt(req.params.id);
  models.posts.findOrCreate({
    where: {
      PostTitle: req.body.postTitle
    },
    defaults: {
      PostBody: req.body.postBody,
      userId: userId
    }
  })
    .spread(function (result, created) {
      if (created) {
        res.redirect('/users/profile/' + userId);
      } else {
        res.send('Pick a new title!');
      }
    });
});

///////////* VIEW POST *//////////////
router.get('/profile/:userid/:postid', function (req, res, next) {
  let userId = parseInt(req.params.userid);
  let postDeleteId = parseInt(req.params.postid);
  models.posts.findOne({
    where: {
      userId: userId,
      PostId: postDeleteId
    }
  })
    .then(post => {
      res.render('postView', {
        PostId: post.PostId,
        userId: post.userId,
        PostTitle: post.PostTitle,
        PostBody: post.PostBody
      });
    });
});

/////////* EDIT POST //////////
router.post('/:userid/:postid/post', function (req, res, next) {
  let userId = parseInt(req.params.userid)
  let postId = parseInt(req.params.postid)
  if (req.body.postTitle !== "" && req.body.postBody !== "") {
    models.posts.update(
      {
        PostTitle: req.body.postTitle,
        PostBody: req.body.postBody
      },
      {
        where: {
          PostId: postId
        }
      }
    )
      .then(user => {
        res.redirect('/users/profile/' + userId + '/' + postId);
      })
  } else if (req.body.postTitle !== "" && req.body.postBody == "") {
    models.posts.update(
      {
        PostTitle: req.body.postTitle
      },
      {
        where: {
          PostId: postId
        }
      }
    )
      .then(user => {
        res.redirect('/users/profile/' + userId + '/' + postId);
      })
  } else if (req.body.postTitle == "" && req.body.postBody !== "") {
    models.posts.update(
      {
        PostBody: req.body.postBody
      },
      {
        where: {
          PostId: postId
        }
      }
    )
      .then(user => {
        res.redirect('/users/profile/' + userId + '/' + postId);
      })
  } else if (req.body.postBody == "" && req.body.postTitle == "") {
    res.redirect('/users/profile/' + userId + '/' + postId);
  }
});

/////////* DELETE POST */////////
router.delete('/:userid/:postid/delete', function (req, res, next) {
  let userId = parseInt(req.params.userid)
  let postDeleteId = parseInt(req.params.postid);
  models.posts.update(
    {
      Deleted: 'true'
    },
    {
      where: {
        PostId: postDeleteId
      }
    }
  )
    .then(user => {
      res.redirect('/users/profile/' + userId);
    })
});

/////////* ADMIN VIEW USER */////////
router.get('/admin/viewUser/:id', function (req, res, next) {
  let userId = parseInt(req.params.id);
  models.users.findOne({
    where: {
      UserId: userId
    }
  })
    .then(user => {
      models.posts.findAll({
        where: {
          userId: userId,
          Deleted: false
        }
      })
        .then(postsFound => {
          res.render('viewUser', {
            FirstName: user.FirstName,
            LastName: user.LastName,
            UserId: user.UserId,
            Email: user.Email,
            Username: user.Username,
            Password: user.Password,
            AdminUser: user.Admin,
            CreationDate: user.createdAt,
            UpdatedDate: user.updatedAt,
            Deleted: user.Deleted,
            posts: postsFound
          });
        });
    });
});

/////////* DELETE USER *//////////
router.delete('/:id/delete', function (req, res, next) {
  let userDeleteId = parseInt(req.params.id);
  models.users.update(
    {
      Deleted: 'true'
    },
    {
      where: {
        UserId: userDeleteId
      }
    }
  )
    .then(user => {
      res.redirect('/users/admin');
    })
});

/////////* ADMIN VIEW POST *//////////
router.get('/admin/:postid/delete', function (req, res, next) {
  let postDeleteId = parseInt(req.params.postid);
  models.posts.findOne({
    where: {
      PostId: postDeleteId
    }
  })
    .then(post => {
      res.render('adminPostDelete', {
        PostId: post.PostId,
        userId: post.userId,
        PostTitle: post.PostTitle,
        PostBody: post.PostBody
      });
    });
});

module.exports = router;
