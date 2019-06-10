# Load balancing: multiple server nodes

1. Créer une branche `fb-load-balancing`

2. Créer le fichier `docker-compose.yml` à la racine du projet avec comme contenu :

   ```
   version: '3'
   
   services:
     reverse-proxy:
       image: traefik # The official Traefik docker image
       container_name: reverse
       restart: always
       command: --api --docker # Enables the web UI and tells Traefik to listen to docker
       ports:
         - "80:80"     # The HTTP port
         - "443:443"
         - "8080:8080" # The Web UI (enabled by --api)
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock # So that Traefik can listen to the Docker events
         - ./traefik.toml:/traefik.toml
         - ~/data/traefik/acme.json:/acme.json
       networks:
         - web
   
     apache_static:
       image: res/static_app
       build:
         context: ./docker-images/static-image
         dockerfile: Dockerfile
       labels:
         - "traefik.frontend.rule=Host:labo.res.ch"
         - "traefik.docker.network=web"
         - "traefik.port=80"
       expose:
         - "80"
       networks:
         - web
   
     express_dynamic:
       image: res/dynamic_app
       build:
         context: ./docker-images/dynamic-image
         dockerfile: Dockerfile
       labels:
         - "traefik.frontend.rule=Host:labo.res.ch; PathPrefixStrip:/api/animals"
         - "traefik.docker.network=web"
         - "traefik.port=3000"
       expose:
         - "3000"
       networks:
         - web
   
   
   networks:
     web:
       external: true
   ```

3. Créer un network Docker avec la commande :

   ```bash
   $ docker network create web
   ```

4. Afin de montrer le load balancing en action, nous allons faire en sorte que les conteneurs statiques et dynamiques nous montrent leurs adresses IP. 

   Pour le conteneur statique, ajouter ceci au fichier `docker-images/static-image/src/index.html` :
   
   ```php+HTML
<script type="text/javascript">
       var ip = "<?php echo $_SERVER['SERVER_ADDR']; ?>";
        alert(ip);
   </script>
```
   
Puis, renommer le fichier `docker-images/static-image/src/index.html` en `docker-images/static-image/src/index.php`
   
   Pour le conteneur dynamique, ajouter un paquet "npm". Pour cela, il faut se rendre dans le dossier `docker-images/dynamic-image/src` puis faire la commande :
   
```bash
   $ npm install --save ip
```
   
   Aller ensuite modifier le fichier `index.js`pour qu'il soit comme ceci :
   
   ```js
   var Chance = require('chance');
   var chance = new Chance();
   var ip = require("ip");
   var express = require('express')
   var app = express();
   
   app.get('/', function(req, res){
           console.log("Hi, i'm server: ");
           console.log(ip.address() + " " + Date.now());
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
           return animals;
   }
   ```
   
   Une fois ces étapes réalisées, reconstruire les images :
   
   ```bash
   $ cd docker-images/static-image
   $ docker build -t res/static_app .
   $ cd ../dynamic-image
   $ docker build -t res/dynamic_app .
   ```
   
5. Lancer un test avec la commande :

   ```bash
   $ docker-compose up -d --scale apache_static=4 --scale express_dynamic=4
   ```

   Cette commande lance 4 conteneurs statiques, 4 conteneurs dynamiques et le reverse proxy géré par traefik. 

   En se rendant sur la page du [conteneur statique](http://labo.res.ch/), nous allons obtenir une alerte qui va nous indiquer sur quel serveur statique nous sommes arrivé. Chaque pression sur la touche `F5` va, derrière les décors, nous faire migrer sur différents serveurs statiques. 

   Pour tester le *load balancing* des nœuds express, nous pouvons utiliser la commande :

   ```bash
   $ docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_1 | sed -e 's/^/[-- 1 --]/' & docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_2 | sed -e 's/^/[-- 2 --]/' & docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_3 | sed -e 's/^/[-- 3 --]/' & docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_4 | sed -e 's/^/[-- 4 --]/'
   ```

   Ici, il faut remplacer le nom `teachingheigvdres2019labohttpinfra_express_dynamic_x` par le nom de chaque conteneur. Cela va afficher les informations suivantes, qui vont se mettre à jour à chaque  requête ajax faite aux nœuds.

   ![loadbalancing_express](./images/loadbalancing_express.png)