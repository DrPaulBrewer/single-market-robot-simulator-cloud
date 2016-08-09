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
	datestamp: myDateStamp(),
	shell: {
	    simulations: {
		command: [
		    'cd ./run',
		    'for d in */*; do ( cd $d; node ../../../node_modules/single-market-robot-simulator/build/index.js ) & done',
		    'wait'].join(';')
	    },
	    zip: {
		command: [
		    'cd ./run',
		    'zip -9 -r ../data.zip .'
		].join(';')
	    },
	    uploadToSite: {
		command: 'curl --silent --upload-file ./data.zip '+process.env.UPLOADURL
	    },
	    uploadToBucket: {
		command: [
		    'cd ./run',
		    'gsutil cp -r . '+process.env.BUCKET
		    ].join(';')
	    },
	    shutdown: {
		command: 'sudo shutdown -h now'
	    }
	}
    });

    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('makedirs', 'making directories and configuration file for each simulation', function(){
	const scenario = grunt.file.readJSON('./config.json');
	(scenario
	 .configurations
	 .forEach(function(sim,i){
	     const dirname = "run/"+grunt.config.get('datestamp')+"/"+letter(i);
	     grunt.file.mkdir(dirname);
	     Object.assign(sim, scenario.common);
	     if (sim.periods>500) sim.withoutOrderLogs=true;
	     grunt.file.write(dirname+"/config.json", JSON.stringify(sim,null,2));
	 })
	);
    });

    grunt.registerTask('default',[
	'http:getConfigJson', 
	'makedirs', 
	'shell:simulations',
	'shell:zip',
	'shell:uploadToSite',
	'shell:shutdown'
    ]);

};
