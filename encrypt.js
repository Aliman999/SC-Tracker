var fs = require('fs');
var path = require('path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
var JavaScriptObfuscator = require('javascript-obfuscator');

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      if(file != `.git` && file != `.gitignore` && file != `encrypt.js` && file != `node_modules` && file != `package-lock.json` && file != `package.json` && file != `.env` && file != `encrypted`){
        file = path.resolve(dir, file);
        if(file.indexOf(`.js`) > -1){
          var obfuscationResult = JavaScriptObfuscator.obfuscate(fs.readFileSync(file, 'utf8'),
          {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 1,
            debugProtection: true,
            debugProtectionInterval: 1,
            disableConsoleOutput: true,
            log: false,
            mangle: false,
            renameGlobals: false,
            rotateStringArray: true,
            selfDefending: true,
            stringArray: true,
            stringArrayEncoding: ['rc4'],
            stringArrayThreshold: 1,
            unicodeEscapeSequence: false
          })
          const dir = file.split("\\");
          dir.splice(5, 0, `encrypted`);
          fs.writeFileSync(dir.join("\\"), obfuscationResult._obfuscatedCode, { flag: 'w' });
        }else{
          fs.stat(file, function(err, stat) {
            if (stat && stat.isDirectory()) {
              walk(file, function(err, res) {
                results = results.concat(res);
                if (!--pending) done(null, results);
              });
            } else {
              results.push(file);
              if (!--pending) done(null, results);
            }
          });
        }
      }
    });
  });
};

walk(appDir, function(err, results) {
  if (err) throw err;
  console.log(results);
});