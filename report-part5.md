# Step 5: AJAX requests with JQuery

1. Créer la branche `fb-dynamic-conf`

2. Créer un nouveau document `/docker-images/reverse-image/apache2-foreground`. Le contenu est le suivant :

   ```bash
   #!/bin/bash
   set -e
   
   # Note: we don't just use "apache2ctl" here because it itself is just a shell-script wrapper around apache2 which provides extra functionality 
   # like "apache2ctl start" for launching apache2 in the background.
   # (also, when run as "apache2ctl <apache args>", it does not use "exec", which leaves an undesirable resident shell process)
   
   
   # Add RES's Lab configuration
   # php /var/apache2/templates/config-template.php > /etc/apache2/sites-available/001-reverse-proxy.conf
   
   echo "Setup for the RES lab..."
   echo "Static app URL: $STATIC_APP"
   echo "Dynamic app URL: $DYNAMIC_APP"
   
   
   : "${APACHE_CONFDIR:=/etc/apache2}"
   : "${APACHE_ENVVARS:=$APACHE_CONFDIR/envvars}"
   if test -f "$APACHE_ENVVARS"; then
    . "$APACHE_ENVVARS"
   fi
   
   # Apache gets grumpy about PID files pre-existing
   : "${APACHE_RUN_DIR:=/var/run/apache2}"
   : "${APACHE_PID_FILE:=$APACHE_RUN_DIR/apache2.pid}"
   rm -f "$APACHE_PID_FILE"
   
   # create missing directories
   # (especially APACHE_RUN_DIR, APACHE_LOCK_DIR, and APACHE_LOG_DIR)
   for e in "${!APACHE_@}"; do
    if [[ "$e" == *_DIR ]] && [[ "${!e}" == /* ]]; then
     # handle "/var/lock" being a symlink to "/run/lock", but "/run/lock" not existing beforehand, so "/var/lock/something" fails to mkdir
     #   mkdir: cannot create directory '/var/lock': File exists
     dir="${!e}"
     while [ "$dir" != "$(dirname "$dir")" ]; do
      dir="$(dirname "$dir")"
      if [ -d "$dir" ]; then
       break
      fi
      absDir="$(readlink -f "$dir" 2>/dev/null || :)"
      if [ -n "$absDir" ]; then
       mkdir -p "$absDir"
      fi
     done
   
     mkdir -p "${!e}"
    fi
   done
   
   exec apache2 -DFOREGROUND "$@"
   ```

   La base se trouve au lien suivant : 

   https://github.com/docker-library/php/blob/master/7.2/stretch/apache/apache2-foreground

   Nous y avons ajouté les lignes suivantes :

   ```bash
   echo "Setup for the RES lab..."
   echo "Static app URL: $STATIC_APP"
   echo "Dynamic app URL: $DYNAMIC_APP"
   ```

3. Le Dockerfile à l'emplacement `/docker-images/reverse-image/` est également modifié comme suit :

   ```bash
   FROM php:7.2-apache
   
   RUN apt-get update && apt-get install -y vim
   
   COPY apache2-foreground /usr/local/bin
   COPY templates /var/apache2/templates
   
   COPY conf/ /etc/apache2
   
   RUN a2enmod proxy proxy_http
   RUN a2ensite 000-* 001-*
   ```

4. Au même emplacement, construire l'image Docker avec la commande :

   ```bash
   $ docker build -t res/reverse_app .
   ```

5. Tester en lançant un conteneur et en lui passant des variables d'environnement en paramètre. Cela ce fait comme ceci :

   ```bash
   $ docker run -e STATIC_APP=172.17.0.2:80 -e DYNAMIC_APP=172.17.0.3:3000 res/reverse_app
   ```

6. Créer un dossier `/docker-images/reverse-image/templates`

7. Créer le fichier `/docker-images/reverse-image/templates/config-template.php`. Ce dernier contient le code suivant :

   ```php
   <?php
     $dynamic_app = getenv('DYNAMIC_APP');
     $static_app = getenv('STATIC_APP');
   ?>
   <VirtualHost *:80>
     ServerName labo.res.ch
   
   
     ProxyPass '/api/animals/' 'http://<?php print "$dynamic_app"?>/'
     ProxyPassReverse 'api/animals/' 'http://<?php print "$dynamic_app"?>/'
   
     ProxyPass '/' 'http://<?php print "$static_app"?>/'
     ProxyPassReverse '/' 'http://<?php print "$static_app"?>/'
   
   </VirtualHost>
   ```

8. Tester le fichier `config-template.php` en créant tout d'abord des variables d'environnement :

   ```bash
   export STATIC_APP=172.17.0.2
   export DYNAMIC_APP=172.17.0.3
   ```

   Avant de continuer, s'assurer d'avoir `php` installé sur sa machine :

   ```bash
   $ php config-template.php
   ```

   Le résultat devrait être le suivant (varie en fonction des variables d'environnement précédemment entrées) :

   ```bash
   <VirtualHost *:80>
     ServerName labo.res.ch
   
   
     ProxyPass '/api/animals/' 'http://172.17.0.3/'
     ProxyPassReverse 'api/animals/' 'http://172.17.0.3/'
   
     ProxyPass '/' 'http://172.17.0.2/'
     ProxyPassReverse '/' 'http://172.17.0.2/'
   
   </VirtualHost>
   ```

9. Modifier ensuite le fichier `apache2-foreground` en lui ajoutant la ligne suivante sous les 3 `echo` précédemment rentrés.

   ```
   php /var/apache2/templates/config-template.php > /etc/apache2/sites-available/001-reverse-proxy.conf
   ```

10. Tester en suivant les étapes suivantes, tout en étant dans le dossier `docker-images` :

    ```bash
    $ cd reverse-image/
    $ docker build -t res/reverse_app .
    $ cd ../static-image/
    $ docker build -t res/static_app .
    $ cd ../dynamic-image/
    $ docker build -t res/dynamic_app .
    $ docker run -d res/static_app
    $ docker run -d res/static_app
    $ docker run -d res/static_app
    $ docker run -d res/static_app
    $ docker run -d res/static_app
    $ docker run -d --name static res/static_app
    $ docker run -d res/dynamic_app
    $ docker run -d res/dynamic_app
    $ docker run -d res/dynamic_app
    $ docker run -d res/dynamic_app
    $ docker run -d --name dynamic res/dynamic_app
    $ docker inspect static | grep -i ipaddress
    $ docker inspect dynamic | grep -i ipaddress
    $ docker run -d -e STATIC_APP=172.17.0.7:80 -e DYNAMIC_APP=172.17.0.12:3000 --name reverse -p 8080:80 res/reverse_app
    ```

    Une fois ces commandes exécutées, ouvrir un navigateur internet et se rendre sur le lien suivant : 

    <http://labo.res.ch:8080/>
    
    Nous devrions avoir notre page statique avec les noms des animaux comme pour la partie précédente. 

