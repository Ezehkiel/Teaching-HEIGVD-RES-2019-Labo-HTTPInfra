# Management UI (0.5 pt)

1. Créer une branche `fb-docker-gui`

2. Nous allons utiliser [Portainer](<https://www.portainer.io/>) pour gérer nos conteneurs Docker. Pour faire ceci de manière simplifiée nous ajoutons un paragraphe dans le fichier `docker-compose.yml` situé à la racine du projet : 

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

   Le fichier dans sa totalité ressemble à ceci :

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

   Une fois le fichier modifié, il suffit de lancer la commande suivante :

   ```bash
   $ docker-compose up -d
   ```

   Cette dernière va lancer un conteneur pour chaque service. 
   
   Une fois cela fait, il est possible de se rendre sur [la page web du conteneur portainer](http://labo.res.ch:9000/#/home). Renseigner un nom d'utilisateur ainsi qu'un mot de passe puis sélectionner l'endpoint appelé `local`.
   
   Il est également possible de se rendre sur la page de [traefik](<http://labo.res.ch:8080/dashboard/>), qui s'occupe du reverse proxy.
   
   La page web de notre conteneur statique se trouve [à ce lien](http://labo.res.ch).
   
   Nous pouvons à présent gérer nos conteneurs depuis Portainer. A l'aide de cet outil, nous pouvons visualiser les logs des conteneurs et, donc, pouvons constater le *load balancing* en action en se rendant simplement sur les logs des conteneurs dynamiques. En effet, ils affichent le timestamp de la requête reçue en temps réel.

