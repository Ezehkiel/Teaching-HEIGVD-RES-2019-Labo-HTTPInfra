# Management UI (0.5 pt)

1. Création d'une branche `fb-docker-gui`

2. Nous allons utiliser [Portainer](<https://www.portainer.io/>) pour gérer nos conteneurs Docker. Pour faire ceci de manière simplifié nous allons ajouter un paragraphe dans le fichier `docker-compose.yml` : 

   ```
   portainer:
     image: portainer/portainer
     container_name: portainer
     restart: always
     ports:
       - "9000:9000"
     volumes:
       - /var/run/docker.sock:/var/run/docker.sock
       - portainer_data:/data
     networks:
       - web
   ```

   Le fichier doit donc contenir ceci:

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
   
     portainer:
       image: portainer/portainer
       container_name: portainer
       restart: always
       ports:
         - "9000:9000"
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
         - portainer_data:/data
       networks:
         - web
   
   networks:
     web:
       external: true
   
   volumes:
     portainer_data:
       external: true
   ```

   Une fois le fichier modifier il suffit de faire un `docker-compose up -d`, il va lancer un conteneur de chaque service. Une fois cette commande faite il est possible de se rendre sur [la page web du conteneur portainer](http://labo.res.ch:9000/#/home). Il faut renseigner un nom d'utilisateur ainsi qu'un mot de passe. Il faut ensuite sélectionner un "endpoint", il faut alors sélectionner "local". 

   Il est aussi possible d'aller [sur la page de traefik](<http://labo.res.ch:8080/dashboard/>) qui s'occupe du reverse proxy.

   Puis nous avons notre page web qui se trouve [ici](http://labo.res.ch)

   Il est ensuite possible de gérer ses conteneur depuis Portainer. Il est possible de voir les logs des conteneur et donc de pouvoir voir le loadbalancing en action en allant sur le logs des conteneurs dynamiques car ils affichent le timestamp de la requêtes.

