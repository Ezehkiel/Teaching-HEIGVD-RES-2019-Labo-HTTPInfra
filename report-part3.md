---
typora-root-url: images
---

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

8. Creation d'un dossier `conf/sites-available`

9. Création des deux fichier de config

   000-default.conf

   ```bash
   <VirtualHost *:80>
   </VirtualHost>
   ```

   001-reverse-proxy.conf

   ```bash
   <VirtualHost *:80>
     ServerName labo.res.ch
   
   
     ProxyPass "/api/animals/" "http://172.17.0.3:3000/"
     ProxyPassReverse "api/animals/" "http://172.17.0.3:3000/"
   
     ProxyPass "/" "http://172.17.0.2:80/"
     ProxyPassReverse "/" "http://172.17.0.2:80/"
   
   </VirtualHost>
   ```

10. Création de l'image a l'aide de la commande `$ docker build -t res/apache_reverse_proxy .`

11. AJout d'une entrée dans le fichier `/etc/hosts` afin de résoudre notre nom DNS

    `192.168.99.100	labo.res.ch`

12. Lancement de tous le containaires (il faut faire attention a l'ordre avec le quel on lance les contenaire car nous avons renseigné les adresses ip en dur dans le fichier de conf)

    ```bash
    $ docker run -d --name apache_static res/apache_step1
    $ docker run -d --name express_dynamic res/express_step2b
    $ docker run -d -p 8080:80 --name reverse_proxy res/apache_reverse_proxy
    ```

13. Nous testons et nous pouvons voir que si nous utilisons notre navigateur nous avons bien la redirection qui est effectué:

    ![reverse_proxy_static](/reverse_proxy_static.png)

    

    ![reverse_proxy_express](/reverse_proxy_express.png)

