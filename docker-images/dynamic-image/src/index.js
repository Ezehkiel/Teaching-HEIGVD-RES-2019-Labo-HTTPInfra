var Chance = require('chance');
var chance = new Chance();

var express = require('express')
var app = express();

app.get('/', function(req, res){
	res.send(generateAnimals());
});

app.listen(3000, function(){
	console.log('Accepting HTTP requests on port 3000.');
});

function generateAnimals(){
	var numberOfAnimals = chance.integer({
		min: 0,
		max: 5
	});
	var animals= [];
	for (var i = 0; i < numberOfAnimals; ++i){
		var gender= chance.gender();
		var animal= chance.animal();
		var country= chance.country({ full: true });
		var birthYear = chance.year({
			min: 2010,
			max: 2019
		});
		animals.push({
			typeAnimals: animal,
			country: country,
			firstName: chance.first({
				gender: gender
			}),
			lastName: chance.last(),
			gender: gender,
			birthday: chance.birthday({
				year: birthYear
			})
		});
	};
	console.log(animals);
	return animals;
}
