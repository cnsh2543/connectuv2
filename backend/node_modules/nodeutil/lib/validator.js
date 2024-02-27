var _ = require('underscore');
//See: https://github.com/chriso/validator.js
var validator = require('validator'); 

/**
 * Sample model
 *
 * var user = {
 *   username: {
 *     type: "string", require: true, max: 200, desc: 'the username, must provide as an email address', 
 *     validator: validator.isEmail
 *   },
 *   password: {
 *     type: "string", require: false, max: 200, desc: 'the password'
 *   }, 
 *   created: {
 *     type: "number", require: true, max: 200, "default":-1, desc: 'the create time in number format', 
 *     map: function(v) {
 *       if(v == -1) return new Date().getTime();
 *     }
 *   },
 *   user_type: {
 *     type: "number", require: true, "default": 0, pick: [0,1,2], updatable: true, desc:'the user type to define the role of user'
 *   },
 *   test: {
 *     type: "string", require: false, max: 200, desc: 'just for test', 
 *     map: function(v) {
 *       return "111" + v;
 *     }
 *   }
 * }
 */

function updatable(model){
  var modelKeys = Object.keys(model);
  var out = [];
  for(var i = 0; i< modelKeys.length; i++) {
    var vo = model[modelKeys[i]];
    if(vo['updatable']) {
      out.push(modelKeys[i]);
    }
  }
  return out;
}
exports.updatable = updatable

exports.pick = pick;
function pick(vo, model) {
  return _.pick(vo, Object.keys(model));
}

exports.check = check; 
function check(vo, model) {
  var modelKeys = Object.keys(model);
  var out = {};
  for(var i = 0; i< modelKeys.length; i++) {
    var k = modelKeys[i];
    var v = model[k];

    //check default
    if(v.default)
      vo[k] = v.default;

    //check required
    if(v.require) 
      if(!vo[k] && vo[k] != 0) throw "value of key [" + k + "] not found";

    //check vo has value
    if(Object.keys(vo).indexOf(k)>=0){
      out[k] = vo[k];

      if(v.type) {
        if(v.type == 'number' && !isNaN(vo[k])) {
          vo[k] = parseInt(vo[k]);
        } 
        if(typeof(vo[k]) != v.type ) throw "type of [" + k + "] is not correct"
      }

      //check max
      if(v.max) 
        if(vo[k] && vo[k].length > v.max) throw "value of [" + k + "] over the column max size";
          
      //check value in the pick range
      if(v.pick && vo[k]) {
        if(_.indexOf(v.pick, vo[k]) < 0) throw "the value of [" + k + "] is not in the pick range"
      }

      //check execute map function 
      if(v.map && vo[k]) 
        out[k] = v.map(vo[k]);

      //check validator
      if(v.validator) 
        if(!v.validator(vo[k])) throw "the value of [" + k + "] is not validate"
      
      
    }
  }
  return out;
}
