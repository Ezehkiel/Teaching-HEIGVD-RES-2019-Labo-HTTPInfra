# Step 4: AJAX requests with JQuery

1. Creation d'une branche `fb-ajax`

2. Ajout de vim dans les 3 images. Pour cela il faut ajouter cette ligne dans chaque Dockerfile

   `RUN apt-get update && apt-get install -y vim	`

3. Relancer les 3 conteneurs (dans l'ordre)

   ```bash
   $ docker run -d --name apache_static res/apache_step1
   $ docker run -d --name express_dynamic res/express_step2b
   $ docker run -d -p 8080:80 --name reverse_proxy res/apache_reverse_proxy
   ```

4. Verifier que `vim` est installé sur les 3 conteneur. Pour cela il faut se connecter sur chaque conteneur à l'aide de la commande `docker exec -it <nomConteneur> /bin/bash` puis une fois sur la machine faite un `vim test`, si vim s'ouvre c'est qu'il est installé correctement.

5. Arreter les 3 conteneurs et les supprimer

6. Créer un fichier `animals.js` dans le dossier `docker-images/apache-step1/src/js` et y ajouter le code suivant:

   ```
    $(function() {
    
       console.log("Loading animals");
       function loadAnimals() {
           $.getJSON("/api/animals/", function( animals){
             console.log(animals);
             $("#customContent").empty();
             var message ="";
             if( animals.length > 0){
               for( var i = 0; i < animals.length ; ++i){
                 message += "<p>" + animals[i].firstName + " who is a " + animals[i].typeAnimals + "</p>";
               }
             }else{
               message = "No animals are there";
             }
           $("#customContent").append(message);
         });
       };
     loadAnimals();
     setInterval( loadAnimals, 5000);
   });
   ```

   Puis dans le fichier `index.html` qui se trouve `docker-images/apache-step1/src` il faut ajouter la ligne `<script src="js/animals.js"></script>` en bas du fichier. Nous avons aussi ajouté un id à la balise ou nos animaux seront ajoutés.