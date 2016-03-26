console.log("Galaxy - Kue Job Sync");

var request = require('request');
var prettyjson = require('prettyjson');
var prompt = require('prompt');
var fs = require('fs');

// enables http debugging
//require('request-debug')(request);  



/*
 * setup kui ui
 * 
 */

var kue = require('kue');
var express = require('express');
var ui = require('kue-ui');
var app = express();

// connect kue to appropriate redis, or omit for default localhost
/*
kue.createQueue({
    redis: REDIS_URL
});
*/
ui.setup({
    apiURL: '/api', // IMPORTANT: specify the api url
    baseURL: '/kue', // IMPORTANT: specify the base url
    updateInterval: 5000 // Optional: Fetches new data every 5000 ms
});

// Mount kue JSON api
app.use('/api', kue.app);
// Mount UI
app.use('/kue', ui.app);

app.listen(3000);





// prettyjson options
var pOptions = {
  keysColor: 'yellow',
  dashColor: 'magenta',
  stringColor: 'white'
};


/*
 * 
 */
var kue = require('kue')
  , queue = kue.createQueue();



// api key on local galaxy
var galaxyUrl = "http://192.168.56.102:8080";
var apiKey = "2bb67717b99a37e92e59003f93625c9b";

//cleanupQueue();








// rescan every 5 sec
var intervalCount = 0;
setInterval(function(){
    console.log("intervalCount "+intervalCount++);
    syncGalaxyJobs();
},5000);




/*
 * Synchronizes kue queue with galaxy job queue.
 * @returns {undefined}
 */
function syncGalaxyJobs() {
    console.log('loadGalaxyJobs()');
    n = 1000000;
    
    request(galaxyUrl +"/api/jobs"+"?key="+apiKey, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            //console.log(body);
            //console.log(prettyjson.render(jobs,pOptions)); // Print the body of response.
            try {
                var gJobs = JSON.parse(body);
                
                // mark all gJobs as unprocessed.
                var done = [];
                for(var x in gJobs) {
                    done[x] = false;
                }
                
                // get kue queue
                console.log("get kue queue");
                
                forEachKueJob('galaxy-job', function(kJob) {
                    var found = false;
                    for(var x in gJobs) {
                        var gJob = gJobs[x];
                        if (gJob.id === kJob.data.galaxy_data.id) {
                            done[x] = true;
                            found = true;
                            jobCount--;
                            kJob.state(convertGalaxyState(gJobs[x].state));
                            kJob.save();
                            console.log("existing id "+kJob.data.galaxy_data.id);
                            break;
                        }
                    }
                    if (!found) {
                      // delete
                      kJob.remove( function(){
                        console.log( 'removed ', gJob.id );
                      });
                    }
                });
                
                // add new gJobs to kue
                setInterval(function() {
                    if (jobCount === 0 && typeCount === 0) {
                        //console.log("adding triggered");
                        var c = 0;
                        for(var x in gJobs) {
                              if (!done[x]) {
                                  var job = queue.create('galaxy-job', {
                                      galaxy_data: gJobs[x]
                                  });
                                  job.state(convertGalaxyState(gJobs[x].state));
                                  job.save();
                                  done[x] = true;
                                  c++;
                                  console.log('adding galaxy job: '+gJobs[x].id);
                              }
                        }
                    }
                },1000);
            }
            catch (ex) {
                    console.error(ex);
            }
        
        }
    });
}
/* galaxy job states / kue job state mapping
    ‘new’               inactive
    ‘upload’            active
    ‘waiting’           inactive
    ‘queued’            inactive
    ‘running’           running
    ‘ok’                complete
    ‘error’             failed
    ‘paused’            delayed
    ‘deleted’           ??
    ‘deleted_new’       ??
*/
function convertGalaxyState(gState) {
    var kState = 'inactive';
    
    switch(gState) {
        case 'upload':
            kState = 'active';
            break;
        case 'running':
            kState = 'active';
            break;
        case 'ok':
            kState = 'complete';
            break;
        case 'error':
            kState = 'failed';
            break;
        case 'paused':
            kState = 'delayed';
            break;
    }
    return kState;
}
var jobCount = 0;
var typeCount = 0;
function forEachKueJob(jobType,callback) {
    var n = 100000;
    jobCount = 0;
    typeCount = 5;

    kue.Job.rangeByType(jobType, 'inactive', 0 , n, 'asc', function(err, kJobs) {
        jobCount += kJobs.length;
        typeCount--;
        console.log(kJobs.length);
        kJobs.forEach(function(kJob) {
            callback(kJob);
        });
    });
    kue.Job.rangeByType(jobType, 'active', 0 , n, 'asc', function(err, kJobs) {
        jobCount += kJobs.length;
        typeCount--;
        console.log(kJobs.length);
        kJobs.forEach(function(kJob) {
            callback(kJob);
        });
    });
    kue.Job.rangeByType(jobType, 'complete', 0 , n, 'asc', function(err, kJobs) {
        jobCount += kJobs.length;
        typeCount--;
        console.log(kJobs.length);
        kJobs.forEach(function(kJob) {
            callback(kJob);
        });
    });
    kue.Job.rangeByType(jobType, 'delayed', 0 , n, 'asc', function(err, kJobs) {
        jobCount += kJobs.length;
        typeCount--;
        console.log(kJobs.length);
        kJobs.forEach(function(kJob) {
            callback(kJob);
        });
    });
    kue.Job.rangeByType(jobType, 'failed', 0 , n, 'asc', function(err, kJobs) {
        jobCount += kJobs.length;
        typeCount--;
        console.log(kJobs.length);
        kJobs.forEach(function(kJob) {
            callback(kJob);
        });
    });
}

function cleanupQueue () {
    var n = 100000; // some large number
    kue.Job.rangeByState( 'inactive', 0, n, 'asc', function( err, jobs ) {
      jobs.forEach( function( job ) {
        job.remove( function(){
          console.log( 'removed ', job.id );
        });
      });
    });
    kue.Job.rangeByState( 'active', 0, n, 'asc', function( err, jobs ) {
      jobs.forEach( function( job ) {
        job.remove( function(){
          console.log( 'removed ', job.id );
        });
      });
    });
    kue.Job.rangeByState( 'failed', 0, n, 'asc', function( err, jobs ) {
      jobs.forEach( function( job ) {
        job.remove( function(){
          console.log( 'removed ', job.id );
        });
      });
    });
    kue.Job.rangeByState( 'delayed', 0, n, 'asc', function( err, jobs ) {
      jobs.forEach( function( job ) {
        job.remove( function(){
          console.log( 'removed ', job.id );
        });
      });
    });
    kue.Job.rangeByState( 'complete', 0, n, 'asc', function( err, jobs ) {
      jobs.forEach( function( job ) {
        job.remove( function(){
          console.log( 'removed ', job.id );
        });
      });
    });
}