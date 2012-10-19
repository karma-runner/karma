var git = require('gift');

var repo = git('.');

repo.commits('v0.4.0', function(err, commits){
  console.log(commits);
});


