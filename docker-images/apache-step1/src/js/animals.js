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
