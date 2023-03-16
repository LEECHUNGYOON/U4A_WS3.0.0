#!/usr/bin/env node

(module = Object.assign(require('./module.js'), {
	argv: process.argv.slice(2).reduce(function(acc, cur, i, argv) {
		if (argv[(i-1)] && (argv[(i-1)].indexOf('--') == 0))
			acc[argv[(i-1)].replace(/^--/, '')] = cur;
		else
			acc[cur.replace(/^--/, '')] = true;
		return acc;
	}, {}),
	bin: {
		shot: function(argv) {
			module.shot((argv.output || 'screenshot.jpg'), (argv.width || null), function(err, res, stderr) {
				console.log(stderr || res);
			});
		}
	},
	help: function() {
		console.log([
			'schot - Create screenshot',
			'  --output              (default: screenshot.jpg)',
			'  --width'
		].join('\n'));
	},
	main: function() {
		if (process.argv[2] && (['-h', '--help'].indexOf(process.argv[2]) > -1))
			module.help();
		else if (process.argv[2] && (typeof(module.bin[process.argv[2]]) == 'function'))
			module.bin[process.argv[2]](module.argv);
		else
			console.log('Error args not found');
	},
})).main();
