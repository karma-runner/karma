var _ = require('lodash');

var a = {
  a: ["1","2","3"],
  b: "1",
  c: "3"
};

var result = _.chain(a).values().flatten().unique().value();

console.log(result);