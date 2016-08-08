const SMRS = require('single-market-robot-simulator');

function pad(x){
    "use strict";
    return (x<10)? ("0"+x) : (''+x);
}

function myDateStamp(){
    "use strict";
    var now = new Date();
    return ( ''+ now.getUTCFullYear() + 
	     pad(now.getUTCMonth() + 1) +
             pad(now.getUTCDate()) +
             'T' + pad(now.getUTCHours()) +
             pad(now.getUTCMinutes())
	   );
}

function letter(n){
    "use strict";
    var A = "A".charCodeAt(0);
    return String.fromCharCode(A+n);
}

module.exports = function(grunt){

    grunt.initConfig({
	http: {
	    getConfigJson: {
		options: {
		    url: process.env.CONFIGURL
		},
		dest: './config.json'
	    }
	},
	datestamp: myDateStamp()
    });

    grunt.loadNpmTasks('grunt-http');

    grunt.registerTask('makedirs', 'making directories and configuration file for each simulation', function(){
	const scenario = grunt.file.readJSON('./config.json');
	(scenario
	 .configurations
	 .forEach(function(sim,i){
	     const dirname = "run/"+grunt.config.get('datestamp')+"/"+letter(i);
	     grunt.file.mkdir(dirname);
	     Object.assign(sim, scenario.common);
	     grunt.file.write(dirname+"/config.json", JSON.stringify(sim,null,2));
	 })
	);
    });

    grunt.registerTask('simulations','run simulations for each portion of the scenario', function(){
	function runSimulation(dir){ 
	    const cwd = process.cwd();
	    grunt.file.setBase(dir);
	    const config = grunt.file.readJSON("./config.json");
	    if (config.configurations)
		throw new Error("this is the wrong file");
	    const sim = new SMRS.Simulation(config);
	    sim.run({sync:true});
	    grunt.file.setBase(cwd);
	}
	(grunt
	 .file
	 .expand("run/"+grunt.config.get('datestamp')+"/*")
	 .forEach(runSimulation)
	);
    });

    grunt.registerTask('default',['http:getConfigJson', 'makedirs', 'simulations']);

};
