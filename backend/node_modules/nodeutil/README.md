NodeUtil
====================

This is just a tool collect for easy use of some tool library. I will pack some operation for more easy to use.

## Install

```
npm install nodeutil
```

## Usage

```
var nu = require('nodeutil');
```

## Using logger

```
var log = nu.logger.getInstance();
log.info('Test logger...');
```

Or you can insert log name to getInstance() to catelogry your log...

```
var log = nu.logger.getInstance('MAIN_LOG');
```

You can also set logger some advance properties:

```
var log = require('nodeutil').logger.getInstance('io_sockets', {
	path:	'your-logger-path',
	catg: 'log-category-name',
	level: 'log-level',
	logMaxSize: 'max-log-file-size',
	logBackup: 'backup-days'
});
```

## Advance Logger

If your need to do more with log, you can extend the log4js setting like this:

```
var log = nu.logger.addInstance('appjs', {
		"type": "dateFile",
		"filename": 'test-log.log',
		"pattern": "-yyyy-MM-dd-ss.log",
		"alwaysIncludePattern": true
});
```

In addAppender(), you can put appender config using log4js config format. Related config format, please reference to log4js: https://github.com/nomiddlename/log4js-node

For date rolling log, please reference here for dateFile appender: https://github.com/nomiddlename/log4js-node/wiki/Date-rolling-file-appender

## Simple Log

Simple log is fix format using js file name and function name as prefix. It is focus that user can easily find the log exist in

```
var log = require('nodeutil').simplelog;
log.info('Hello %s!');
```

## Using dateutil

```
var dateutil = no.dateutil;
var pattern = 'yyyymmdd hh24:mi:ss';
dateutil.getNowString(pattern);
dateutil.getDateString(new Date(), pattern)
```

## Using step

```
var Step = nu.step;
Step(
  function step1(){
    //do something...
    return something1;
  },
  function step2(step1_returned){
    //do something
    return something2;
  },
  ...
)
```

## Using cfgutil

```
var cfgutil = nu.cfgutil;
//read from json file
var cfg = cfgutil.readJsonCfg('path to json config file');
```

## Using mailutil

```javascript
var mailer = nu.mailutil;

mailer.init(
  {"smtpOptions":{"service":"Gmail", "auth": {"user": "your-account","pass": "your-password"}}, "sender": "NO-REPLY <no-reply@micloud.tw>"}
);

mailer.sendNodeMailAsync('receiver@gmail.com',
  'test mail send...',
  'send mail OK!',
  true,
  function(){
    console.log('Send mail done...');
  }
);
```

Using mailutil through localhost sendmail service

```javascript
var mailer = require('nodeutil').mailutil;

mailer.init(
      {"smtpOptions":{"host":"localhost"}, "sender": "NO-REPLY <no-reply@micloud.tw>"}
    );

mailer.sendNodeMailAsync('yourmail@gmail.com',
  'test mail send...',
  'send mail OK!',
  true,
  function(){
    console.log('Send mail done...');
  }
);
```

Advance using mailutil...

```javascript
mailer.init(
  {"smtpOptions": {"service":"Gmail",
    "auth": {
      "user": "your_mail_username", "pass": "your_password"
    }},
    "sender": "NO-REPLY <no-reply@your.mail.address>"
  }
);

mailer.sendNodeMail({
    to:["receiver1@gmail.com"],
    subject: "test123",
    html:"<h1>TEST123</h1>",
    cc:["cc-receiver@gmail.com"],
    attachments: [//see detail: https://github.com/andris9/Nodemailer#attachment-fields
       {   // utf-8 string as an attachment
            fileName: "text1.txt",
            contents: "hello world!"
        },
        {   // binary buffer as an attachment
            fileName: "text2.txt",
            contents: new Buffer("hello world!","utf-8")
        }]
  },
  true, function(res){
    console.log(res);
  }
);
```

## Convert Json to Table
```javascript
var json2table = nu.json2table;
var json = [{aaa:123, bbb:223}, {aaa:223, bbb:323}];
console.log(json2table.ConvertJsonToTable(json));
```

The result:
```html
<table border="1" cellpadding="1" cellspacing="1"><thead><tr><th>aaa</th><th>bbb</th></tr></thead><tbody><tr><td>123</td><td>223</td></tr><tr><td>223</td><td>323</td></tr></tbody></table>
```

## Generate GUID
```javascript
var guid = nu.guid;
//Generate a guid without prefix and postfix
console.log( guid.getGuid('%s%s%s', 0,0));
//Generate a guid with 2 digit prefix and 3 digit postfix
console.log( guid.getSimpleGuid('%s-%s-%s', 2,3));

//Generate a guid using specifc seed
var a = '12341234'
console.log( guid.getSimpleGuidWithSeed(a, '%s-%s-%s', 2,3));
```

The result:
```bash
-13ee608f7e0-
FE-13ee608f7e1-Dia
rm-12341234-eep
```

## Simple Validator

Create model

```
var validator = require('nodeutil').validator;
var usermodel = {
    username: {
      type: "string", require: true, max: 200, desc: 'the username, must provide as an email address',
      validator: validator.isEmail
    },
    password: {
      type: "string", require: false, max: 200, desc: 'the password'
    },
    sex: {
      type: "string", require: true, max: 200, desc: 'the sex'
    },
    created: {
      type: "number", require: true, max: 200, "default":-1, desc: 'the create time in number format',
      map: function(v) {
        if(v == -1) return new Date().getTime();
      }
    },
    user_type: {
      type: "number", require: true, "default": 0, pick: [0,1,2], updatable: true, desc:'the user type to define the role of user'
    },
    test: {
      type: "string", require: false, max: 200, desc: 'just for test',
      map: function(v) {
        return "111" + v;
      }
    }
  }
```

If the object not exist sex:

```
//file: test.js
var user = {
  username: 'simon',
  password: '123',
  user_type: '0'
}

var result = validator.check(user, usermodel);

console.log('check result:', result);
```

Run: 

```
$ node test

/Users/peihsinsu/project/github-projects/nodeutil/lib/validator.js:66
      if(!vo[k] && vo[k] != 0) throw "value of key [" + k + "] not found";
                               ^
value of key [sex] not found
```

If the object is valid

```
//file: test.js
var user = {
  username: 'simon',
  password: '123',
  user_type: '0',
  sex: 'M'
}

var result = validator.check(user, usermodel);

console.log('check result:', result);
```

Run:

```
$ node test
check result: { username: 'simon',
  password: '123',
  sex: 'M',
  created: 1456637453105,
  user_type: '0' }
```



