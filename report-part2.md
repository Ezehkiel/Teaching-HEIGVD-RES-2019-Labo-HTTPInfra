## Step 1: Static HTTP server with apache httpd



## Step 2: Dynamic HTTP server with express.js

1. Création d'une branche fb-express-dynamic
2. Création du dossier express-image dans le dossier "docker-images"
3. Création d'un Dockerfile avec le contenu :

FROM node:10.15

COPY src /opt/app

CMD ["node", "/opt/app/index.js"]

4. Initialisation de node js dans le dossier avec "npm init", initialisation du package.json :

{
  "name": "students",
  "version": "0.1.0",
  "description": "Labs",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Monthoux, Poulard",
  "license": "ISC"
}

5. Ajout de la dépendance Chance avec la commande "npm install --save chance" :

"dependencies": {
  "chance": "^1.0.18"
}

6. Création du fichier index.js :

var Chance = require('chance');
var chance = new Chance();
console.log("Bonjour " + chance.name())

7. Construction de l'image docker avec la commande :

docker build -t res/express_step2 .

8. Test de l'image avec la commande :

docker run res/express_step2

9. Confirmation du bon fonctionnement :

![nodeChanceNameDocker](.\img\nodeChanceNameDocker.png)