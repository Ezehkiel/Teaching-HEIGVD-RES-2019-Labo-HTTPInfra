## Step 3: Reverse proxy with apache (static configuration)

1. Creation d'une branche fb-reverse-proxy

2. Lancement des deux containaires (httpd et node) en leur donnant un nom pour pouvoir les identifier plus facilement.

   ```bash
    $ docker run -d --name apache_static res/apache_step1
   ```

   ```bash
    $ docker run -d --name express_dynamic res/express_step2b
   ```

3. Récuperation des adresses IP des deuc containaires avec la commande `docker inspect <nom_du_container | grep IPAddress`

4. Connexion a `docker-machine` avec la commande 

   ```bash
   $ docker-machine ssh
   ```

5. Vérification que les container fonctionnent bien. 

   ```bash
   $ telnet 172.17.0.2 80
   GET / HTTP/1.0
   ```

   ```bash
   $ telnet 172.17.0.3 3000
   GET / HTTP/1.0
   ```

   On obtien les bonne réponse donc tout est correct.

6. Création du dossier `reverse-proxy` dans le dossier `docker-images`

7. Creation du `Dockerfile` dans le dossier précédemment créé avec la commande