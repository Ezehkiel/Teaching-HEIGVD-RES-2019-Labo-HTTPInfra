## Step 2: Dynamic HTTP server with express.js

1. Création d'une branche fb-express-dynamic
2. Création du dossier dynamic-image dans le dossier "docker-images"
3. Création d'un Dockerfile avec le contenu :

```bash
FROM node:10.15

COPY src /opt/app
WORKDIR /opt/app
RUN npm install

CMD ["node", "/opt/app/index.js"]
```

4. Initialisation de node js dans le dossier avec "npm init", initialisation du package.json :

```bash
{  "name": "students",
  "version": "0.1.0",
  "description": "Labs",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Monthoux, Poulard",
  "license": "ISC"
}
```

5. Ajout de la dépendance Chance avec la commande `npm install --save chance`
6. Ajout de la dépendence Express avec la commande `npm install --save express`
7. Création du fichier index.js :

```js
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
		max: 10
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
```

7. Construction de l'image docker avec la commande :

`docker build -t res/dynamic_app .`

8. Test de l'image avec la commande :

`docker run res/dynamic_app`
