var exec = require('child_process').exec,
    child;

child = exec('node ./js/Main.js --n ./data/cb_api.json organization facebook --out:./out/',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});