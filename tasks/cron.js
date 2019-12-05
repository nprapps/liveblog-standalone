/*

Runs tasks on an automated basis

*/

/** config variables **/
var tasks = ["docs", "template"];

/** end config **/

var async = require("async");
var chalk = require("chalk");
var shell = require("shelljs");

module.exports = function(grunt) {

  grunt.registerTask("cron", "Run the build on a timer", function(interval = 15) {
    var done = this.async();

    console.log(`Setting ${interval} second timer...`);

    setTimeout(function() {
      grunt.task.run(tasks);
      grunt.task.run([`cron:${interval}`]);
      done();
    }, interval * 1000);

  });

};