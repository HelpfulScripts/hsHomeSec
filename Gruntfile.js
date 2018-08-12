/*global module:false*/
module.exports = function(grunt) {
    const sgc  = require('./sharedGruntConfig')(grunt, __dirname, [], 'node', 'hsHomeSec');
	grunt.initConfig(sgc); 
};

