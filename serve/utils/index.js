var cwd = central.cwd;
var User = require(cwd + '/models/user').User;

var reg_uid = /\/people\/([^\/]+)/;

function url2uid(url) {
  url = url || '';
  url = url.trim();
  var m = url.match(reg_uid);
  if (m) uid = m[1];
  return m && m[1] || url;

}
function matchPeople(req) {
  var uid = req.body.uid || req.query.uid || req.params.uid;
  return url2uid(uid);
}

function getUser(opts) {
  opts = opts || {};
  var redir = opts.redir;
  var fn = opts.fn || matchPeople;
  return function(req, res, next) {
    var uid = fn(req);
    var c = res.data = {
      qs: req.query,
      title: uid + '的豆瓣酱',
      uid: uid
    };

    if (!uid) {
      if (redir) {
        if (typeof redir === 'function') redir = redir(req);
        return res.redirect(redir);
      }
      return next(404);
    }

    function end(err, people) {
      c.err = err;
      c.people = people;
      if (people) c.title = people.name + '的豆瓣酱';
      next();
    }

    if (req.user && req.user.uid === uid) {
      return end(null, req.user);
    }

    User.get(uid, end);
  };
}

module.exports = {
  errorHandler: require('./errorHandler'),
  url2uid: url2uid,
  getUser: getUser,
  navbar: function navbar(req, res, next) {
    var links = [];
    links.push({
      href: '/top/',
      active: req.url === '/top/',
      text: '榜单'
    });
    links.unshift({
      href: central.conf.site_root,
      active: req.url === '/',
      text: '首页'
    });
    links.push({
      href: '/mine',
      active: req.url === '/mine',
      text: '我的'
    });
    res.locals.navbar_links = links;
    res.locals.user = req.user;
    next();
  }
};

