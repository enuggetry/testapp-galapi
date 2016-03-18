console.log("Galaxy API Test...");

var request = require('request');
var prettyjson = require('prettyjson');
var prompt = require('prompt');

// enables http debugging
require('request-debug')(request);  

/*
  prompt.start();

  prompt.get(['username', 'email'], function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Email: ' + result.email);
  });

  function onErr(err) {
    console.log(err);
    return 1;
  }
process.exit();
*/
var pOptions = {
  keysColor: 'yellow',
  dashColor: 'magenta',
  stringColor: 'white'
};

// api key on usegalaxy.org
var galaxyUrl = "https://usegalaxy.org";
var apiKey = "key=d44069eb5b4e0bb206be1d6bd01cd943";

// api key on local
var galaxyUrl = "http://192.168.56.102:8080";
var apiKey = "2bb67717b99a37e92e59003f93625c9b";


//showTools();
//showHistories();
//currentHistoryJSON(execTool_blastPlus);
/*
currentHistoryJSON(function(){
    console.log("currentHistoryJSON() done.");
});
*/
execTool_blastPlus();

setTimeout(function() {
    console.log('Done');
}, 5000);

function execTool_blastPlus(){
    console.log('execTool_blastPlus()');
    var params = 
    {
            "tool_id": "toolshed.g2.bx.psu.edu/repos/devteam/ncbi_blast_plus/ncbi_blastp_wrapper/0.1.07",
            "tool_version": "0.1.07",
            "history_id": "f597429621d6eb2b",   // must reference a history
            "inputs": {
                    "query": {
                            "batch": false,
                            "values": [{
                                    "src": "hda",
                                    "hid": 1,
                                    "id": "f2db41e1fa331b3e",
                                    "name": "test ctgA-17400..23000 (+ strand).fasta"
                            }]
                    },
                    "db_opts|db_opts_selector": "file",
                    "db_opts|database": "",
                    "db_opts|histdb": "",
                    "db_opts|subject": {
                            "batch": false,
                            "values": [{
                                    "src": "hda",
                                    "hid": 2,
                                    "id": "f597429621d6eb2b",
                                    "name": "volvox.fa"
                            }]
                    },
                    "blast_type": "blastp",
                    "evalue_cutoff": "0.001",
                    "output|out_format": "ext",
                    "adv_opts|adv_opts_selector": "basic"
            }
    }    
    var jsonstr = JSON.stringify(params);

    request.post({
        url: galaxyUrl+"/api/tools"+"?key="+apiKey, 
        method: 'POST',
        //qs: params,
        headers: {
            //'Content-Type': 'application/json',
            //'Accept':'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding' : 'gzip, deflate',
            'Accept-Language' : 'en-US,en;q=0.5',
            'Content-Length' : jsonstr.length
            //'Referrer':galaxyUrl,
            //'X-Requested-With':'XMLHttpRequest'
        },
        json: params
    }, function(error, response, body){
        if(error) {
            console.log(error);
        } else {
            console.log(response.statusCode, body);
        }
    });    
    
}
function showTools() {
    console.log("showTools()");
    request(galaxyUrl +"/api/tools"+"?key="+apiKey, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            try {
                    var tools = JSON.parse(body);
                    console.log(body);
            }
            catch (ex) {
                    console.error(ex);
            }
            //console.log(prettyjson.render(tools,pOptions)); // Print the body of response.
            /*
            for(x in tools) {
                    //console.dir(histories[x]);
                    history = histories[x];

                    url = galaxyUrl+history.url+"?"+apiKey;
                    console.log(url);
                    request(url, function(error,response,body) {
                            //console.log(body);
                            try {
                                    var history = JSON.parse(body);
                            }
                            catch (ex) {
                                    console.error(ex);
                            }
                            console.log(prettyjson.render(history,pOptions)); // Print the body of response.
                    });

            }
            */
        }
    });
}

function showHistories() {
    console.log('showHistories()');
    request(galaxyUrl +"/api/histories"+"?key="+apiKey, function (error, response, body) {
      if (!error && response.statusCode == 200) {
            //console.log(body);
            try {
                    var histories = JSON.parse(body);
            }
            catch (ex) {
                    console.error(ex);
            }
            console.log(prettyjson.render(histories,pOptions)); // Print the body of response.

            console.log("Showing individual histories...");

            for(x in histories) {
                    //console.dir(histories[x]);
                    history = histories[x];

                    url = galaxyUrl+history.url+"?key="+apiKey;
                    console.log(url);
                    request(url, function(error,response,body) {
                            //console.log(body);
                            try {
                                    var history = JSON.parse(body);
                            }
                            catch (ex) {
                                    console.error(ex);
                            }
                            console.log(prettyjson.render(history,pOptions)); // Print the body of response.
                    });

            }
      }
    });
}

function currentHistoryJSON(postFn) {
    console.log("currentHistoryJSON()");
    
    var myPostFn = postFn;
    
    request(galaxyUrl +"/history/current_history_json", function (error, response, body) {
      if (!error && response.statusCode == 200) {
            //console.log(body);
            try {
                    myPostFn();
            }
            catch (ex) {
                    console.error(ex);
            }
      }
    });
}
