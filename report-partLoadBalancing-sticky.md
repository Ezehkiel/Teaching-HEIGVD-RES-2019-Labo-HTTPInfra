# Load balancing: round-robin vs sticky sessions (0.5 pt)

1. Créer une branche `fb-loadbalancing-sticky`

2. Ajouter la ligne `traefik.backend.loadbalancer.sticky=true` dans les labels du conteneur voulu :

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
         - "traefik.backend.loadbalancer.sticky=true"
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

3. Lancer un test avec la commande :

   ```bash
$ docker-compose up -d --scale apache_static=4 --scale express_dynamic=4
   ```
   
   Cette commande lance 4 conteneurs statiques, 4 conteneurs dynamiques et le reverse proxy géré par traefik. 

   En se rendant sur la page du [conteneur statique](http://labo.res.ch/), nous recevons une alerte nous indiquant sur quel serveur statique on a effectué la requête. Dans cette configuration, même après un rafraîchissement de la page, nous aurons toujours la même adresse IP. Par contre, si nous changeons de navigateur, nous allons voir une nouvelle adresse IP.

   Pour tester le *load balancing* des nœuds express, taper la commande suivante : 
   
   ```bash
   $ docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_1 | sed -e 's/^/[-- 1 --]/' & docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_2 | sed -e 's/^/[-- 2 --]/' & docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_3 | sed -e 's/^/[-- 3 --]/' & docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_4 | sed -e 's/^/[-- 4 --]/'
   ```
   
   Ici, il faut remplacer le nom `teachingheigvdres2019labohttpinfra_express_dynamic_x` par le nom de chaque conteneur. Cela va afficher les informations suivantes, qui vont se mettre à jour à chaque  requête ajax faite aux nœuds.
   
   ![loadbalancing_express](./images/loadbalancing_express.png)