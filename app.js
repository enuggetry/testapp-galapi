console.log("Galaxy API Test...");

var request = require('request');
var prettyjson = require('prettyjson');
  var prompt = require('prompt');

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
  keysColor: 'rainbow',
  dashColor: 'magenta',
  stringColor: 'white'
};

var galaxyUrl = "https://usegalaxy.org";
var apiKey = "key=d44069eb5b4e0bb206be1d6bd01cd943";


request(galaxyUrl +"/api/histories"+"?"+apiKey, function (error, response, body) {
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
  }
});

