## Step 1: Static HTTP server with apache httpd



## Step 2: Dynamic HTTP server with express.js

1. Création d'une branche fb-express-dynamic
2. Création du dossier express-image dans le dossier "docker-images"
3. Création d'un Dockerfile avec le contenu :

```bash
FROM node:10.15

COPY src /opt/app

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

5. Ajout de la dépendance Chance avec la commande "npm install --save chance" :

"dependencies": {
  "chance": "^1.0.18"
}

6. Création du fichier index.js :

```bash
var Chance = require('chance');
var chance = new Chance();
console.log("Bonjour " + chance.name())
```

7. Construction de l'image docker avec la commande :

`docker build -t res/express_step2 .`

8. Test de l'image avec la commande :

`docker run res/express_step2`

9. Confirmation du bon fonctionnement :

![nodeChanceNameDocker](.\images\nodeChanceNameDocker.png)

10. Modification du fichier `index.js` pour y inclure un serveur http écoutant sur le port 3000 :

```bash
var express = require('express')
var app = express();

app.get('/', function(req, res){
        res.send("Hello RES");
});

app.listen(3000, function(){
        console.log('Accepting HTTP requests on port 3000.');
});
```

11. Vérification du bon fonctionnement en lançant le serveur avec la commande `node index.js` et en se connectant dessus via telnet :

![nodeChanceNameDocker](.\images\telnetExpress.png)