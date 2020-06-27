/*global module:false*/
module.exports = function(grunt) {
    const sgc  = require('./sharedGruntConfig')(grunt, __dirname, [], 'node', 'app');
	grunt.initConfig(sgc); 
};

