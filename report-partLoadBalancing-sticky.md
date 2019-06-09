# Load balancing: round-robin vs sticky sessions (0.5 pt)

1. Création d'une branche `fb-loadbalancing-sticky`

2. Ajout de la ligne `traefik.backend.loadbalancer.sticky=true` dans les labels du conteneur voulu.

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

3. Lancement du test avec la commande `docker-compose up -d --scale apache_static=4 --scale express_dynamic=4`. Cette commande va lancer 4 conteneur statique et 4 conteneurs dynamiques et le reverse proxy qui est géré par traefik. En allant sur la page  [du conteneur static](http://labo.res.ch/) on va avoir une alerte qui va nous indiquer sur quel serveur statique on a efféctué la requête. Dans cette configuration même apràs un refresh nous aurons toujours la même adresse ip, par contre si on change de navigateur on va avoir une nouvelle adresse IP.

   Pour test le loadbalancing des nœud expresse il faut faire la commande 

   ```bash
   docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_1 | sed -e 's/^/[-- 1 --]/' & docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_2 | sed -e 's/^/[-- 2 --]/' & docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_3 | sed -e 's/^/[-- 3 --]/' & docker logs -f --tail=30 teachingheigvdres2019labohttpinfra_express_dynamic_4 | sed -e 's/^/[-- 4 --]/'
   ```

   Il faut remplacer les `teachingheigvdres2019labohttpinfra_express_dynamic_x` par le nom des conteneurs. Cela va afficher une ces informations qui vont se mettre à jour lorsque une requetes ajax est faites aux noeuds.

   ![loadbalancing_express](D:/Nas%20Brownies/0.3%20HEIG/Semestre%204/RES/labos/Teaching-HEIGVD-RES-2019-Labo-HTTPInfra/images/loadbalancing_express.png)