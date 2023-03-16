var pkg = require('./package.json'),
	exec = require('child_process').exec,
	fs = require('fs'),
	path = require('path');

module.exports = {
	pkg: (function(i, o) {
		var p = pkg.version.replace(/\./g, ''),
			e = ((process.platform == 'win32') ? '.exe' : '');
		if (i[process.platform])
			i[process.platform].map(function(b) {
				if (!process.pkg)
					o[b] = path.resolve(__dirname, 'bin/'+b+e);
				else if (!fs.existsSync((o[b] = path.resolve(process.env['TEMP'], b+'_'+p+e))))
					fs.writeFileSync(o[b], fs.readFileSync(path.resolve(__dirname, 'bin/'+b+e)));
			});
		return o;
	})({
		'win32': ['shot', 'mouse']
	}, []),
	cmd: {
		shot: function(output, width) {
			switch (process.platform) {
				case 'win32': {
					return module.exports.pkg.shot+' '+output+(width ? ' '+width : '');
				}
				case 'linux': {
					return 'import -window root '+(width ? ' -resize '+width+' -quality '+parseInt(width/20) : '')+' '+output;
				}
				default: {
					throw new Error('unsupported platform');
				}
			}
		},
		mousemove: function(x, y) {
			switch (process.platform) {
				case 'win32': {
					return module.exports.pkg.mouse+' mousemove '+x+' '+y;
				}
				case 'linux': {
					return 'xte "mousemove '+x+' '+y+'"';
				}
				default: {
					throw new Error('unsupported platform');
				}
			}
		},
		mouseclick: function(code) {
			switch (process.platform) {
				case 'win32': {
					return module.exports.pkg.mouse+' mouseclick '+code;
				}
				case 'linux': {
					return 'xte "mouseclick '+code+'"';
				}
				default: {
					throw new Error('unsupported platform');
				}
			}
		}
	},
	shot: function(output, width, callback) {
		if (!callback && width) {
			callback = width;
			width = null;
		}
		exec(module.exports.cmd.shot(output, width), function(err, res) {
			if (typeof(callback) == 'function') {
				if (err)
					return callback(err.message, null, err);
				fs.exists(output, function(exists) {
					if (!exists)
						return callback('Screenshot failed', null, new Error('Screenshot failed'));
					callback(null, output);
				});
			}
		});
	},
	mousemove: function(coords, callback) {
		exec(module.exports.cmd.mousemove(Math.round(coords.x), Math.round(coords.y)), function(err, res) {
			if (typeof(callback) == 'function')
				callback(err, res, err);
		});
	},
	mouseclick: function(key, callback) {
		var code = ['left', 'middle', 'right'].indexOf(key) + 1;
		if (code > 0)
			exec(module.exports.cmd.mouseclick(code), function(err, res) {
				if (typeof(callback) == 'function')
					callback(err, res, err);
			});
		else
			return callback('Detect key failed', null, new Error('Detect key failed'));
	}
}
