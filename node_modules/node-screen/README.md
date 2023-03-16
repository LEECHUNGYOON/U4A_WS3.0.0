# node-screen

[![Version](https://img.shields.io/npm/v/node-screen.svg)](https://www.npmjs.org/package/node-screen)

Take a screenshot of your desktop interactively.

Available in Linux and Windows.

``` javascript
var screen = require('node-screen');
screen.shot('screen.png', function(err, res, stderr) {
	console.log(err || res);
});
```
``` javascript
var screen = require('node-screen');
screen.shot('screen-800px.png', 800, function(err, res, stderr) {
	console.log(err || res);
});
```
``` javascript
var screen = require('node-screen');
screen.mousemove({
	x: 34,
	y: 28
}, function() {
	screen.mouseclick('left');
});
```

``` bash
node-screen shot --output screen.png
```

## Installation
```
npm install -g node-screen
```
