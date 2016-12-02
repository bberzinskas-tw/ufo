var express = require('express')
var app = express()
var low = require('lowdb')
var bodyParser = require('body-parser')
var request = require('request')
var async = require('async')

var ufoAddress = 'http://10.0.0.109'
var db = { sprint: "STABLE", release:"STABLE", latest:"STABLE", staging:"STABLE", production:"STABLE"};

app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/status', function (req, res) {
	console.log(db);
	res.send(db);
})

app.get('/version', function (req, res) {
  console.log('yo?')
	async.parallel({
	    latest: function(callback) {
	        request('http://latest.teamworksapp.com/version.txt', function (error, response, body) {
            if (error) return callback(error);
    				callback(null, body);

    			})
	    },
	    staging: function(callback) {
	        request('http://staging.teamworksapp.com/version.txt', function (error, response, body) {
    			 if (error) return callback(error);
    			    callback(null, body);
			     })
	    },
	    production: function(callback) {
	      request('http://www.teamworksapp.com/version.txt', function (error, response, body) {
			    if (error) return callback(error);
 			    callback(null, body);
  			})
	    }
	}, function(err, results) {
    console.log(err);
	    res.send(results);
	});
})

app.post('/status', function (req, res) {
  if(!req.body.environment) res.send('No environment specified');
  if(!req.body.status) res.send('No status specified');
  console.log(req.body);
  var environment = req.body.environment.toLowerCase();
  var status = req.body.status.toUpperCase();
  db[environment] = status;

/*
/api?top_init=1&top=0|3|FF0000&top_bg=00FF00
/api?top_init=1&top=0|1|FFC000|1|3|FF0000|4|1|FFC000&top_bg=00A00a&top_whirl=220
/api?bottom_init=1&bottom=0|15|FF0000&bottom_bg=0000FF&bottom_morph=500|15
*/

  var ring = '';
  var color = '00FF00';
  var background = '000000';
  var effect = '';

  switch(environment){
  	case 'sprint':
  	case 'latest':
  		ring = "top";
  		break;

  	case 'release':
  	case 'staging':
  	case 'production':
  		ring = "bottom";
  }

  switch(status){
  	case "CONNECTING":
  		color = '0|15|0000FF'
  		effect = ring + '_morph=500|15';
  		break;

    case "BUILDING":
    case "TESTING":
    case "DEPLOYING":
    	color = '0|1|FFC000|1|3|FF0000|4|1|FFC000';
  		background = '00A00A';
  		effect = ring + '_whirl=220';
  		break;

    case "STABLE":
    	color = '0|15|00FF00';
  		break;

    case "UNSTABLE":
    	color = '0|15|FFFF00';
    	effect = ring + '_morph=500|15';
  		break;

    case "FAILED":
    	color = '0|15|FFFF00';
    	effect = ring + '_morph=500|15';
  		break;

    case "ALARM":
    	color= '0|15|FF0000';
    	background= '0000FF',
    	effect = ring + '_morph=500|15';
    	break;

    case "DANCE":
    if (ring == "top" ){
      color= '0|15|FF0000';
      background= 'FF00FF',
      effect = ring + '_morph=500|15';
    } else {
      color= '0|15|0000FF';
      background= '00FF00',
      effect = ring + '_morph=500|15';
    }

      break;
  };

  var url = ufoAddress + '/api?' + ring + '_init=1&' + ring + '='+color+'&'+ring+'_bg='+background+'&' + effect;
  console.log(url);

  request(url, function (error, response, body) {
  	if (!error && response.statusCode == 200) {
    	res.send(db);
	}
  })

})


app.listen(3000, function () {
  console.log('Teamworks UFO app listening on port 3000!')
})

