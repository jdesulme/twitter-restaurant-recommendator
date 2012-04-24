var markersArray = new Array();
var locations = new Array();

var map, 
    position,
    userLat,
    userLng;


$(document).ready(function(){
	initialize();

    $(window).keydown(function(event){
        if(event.keyCode == 13) {
          event.preventDefault();
          return false;
        }
    });

    $('#user').keyup( function(event){
        if (event.which == 13) {
            run(); 
        };
    });

    $('#submit').click( function(){
        run();
    });
/*
    $('.restDisplay').on("click", function(event){
        //event.preventDefault();
        clearMarkers();

        console.log('working');

        console.log(event);

        var num = $(this).attr('id');
        addMarker(map, locations[num]);
    });
*/
});

function restDisplay(obj) {
    console.log(locations);

    clearMarkers();

    var num = obj.attributes['id'].value;

    addMarker(map, locations[num]);

}

function run() {
    //clears previous data
    clearAll();
    $('#restaurants').empty();

    //retrieve user inputed information
    var twitterName = $('#user').val();
    var foodType = $('#food').val();

    // Try HTML5 geolocation
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( function(position){
            window.log("Current Location ---> lat: " + position.coords.latitude + " lng: " + position.coords.longitude);    
            userLat = position.coords.latitude;
            userLng = position.coords.longitude;
        });
    }

    getRecommendations(twitterName, foodType, userLat, userLng);
}

function initialize() {
    map = new google.maps.Map(document.getElementById("map_canvas"), {
        zoom: 10,
        center:  new google.maps.LatLng(43.05922899999999, -77.612222), 
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    run();
}


function getRecommendations(twitterName, foodType, userLat, userLng) {
	if (twitterName == "" || twitterName == null ) { twitterName = "jsleepy89"; };
	if (userLat == "" || userLat == null) { userLat = 43.05922899999999; }; 
	if (userLng == "" || userLng == null) { userLng = -77.612222; };

	twitterName = twitterName.replace (/[^a-z0-9A-Z_]/g, '');
    console.log(twitterName);

	$.ajax({
		url : "http://api.hunch.com/api/v1/get-recommendations/",
		dataType : "jsonp",
		data : {
			topic_ids : "list_restaurant",
			lat: userLat, //current users location
			lng: userLng, //current users location
			radius: 25,
			query: foodType,
			user_id : "tw_" + twitterName,
			
		},
		success: function(json) {
           window.log(json);
           var count = 0;
            $.each (json.recommendations, function (k, v) { 
                locations.push({
                    name: v.name, 
                    description: v.description,
                    hours: v.hours,
                    address: v.address,
                    street: v.street,
                    city: v.city,
                    state: v.state,
                    zip: v.zip,
                    phone: v.phone,
                    stars: v.stars,
                    lat: v.lat,
                    lng: v.lng,
                    url: v.url,
                    is_personalized: v.is_personalized,
                    image: v.image_url,
                    count: count
                });

                count++;
            });

            window.log(locations);
            
            //add markers to the map now
            addMarkers(map, locations);

            //populate restaurants on page
            $.template("restTmpl", $("#restTmpl"));
            $.tmpl("restTmpl", locations).appendTo("#restaurants");

	    },
        complete: function() {
            //hide loading image
        }
    });

	return locations;	
}


//adds each marker to the map
function addMarkers( map, locations ) {

    for (i = 0; i < locations.length; i++) {  
        addMarker(map, locations[i]);
    }
}


function addMarker( map, location ) {
    var infowindow = new google.maps.InfoWindow();

    var marker, i;

    marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.lat, location.lng),
        map: map,
        draggable: false,
        icon: iconImage(location.is_personalized),
        title: location.name,
        animation: google.maps.Animation.DROP
    });

    markersArray.push(marker);

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
            infowindow.setContent("<div class='map_content'><h5><strong>" + location.name + "</strong></h5>"+
                "<p>" + storeImage(location.image) + location.address + "</p>" + 
                "<p>" + starImages(location.stars) + "</p></div>");

            infowindow.open(map, marker);
        }
    })(marker, i));

}

function storeImage(image){
    var string = "";
    
    if (typeof image != 'undefined') {
       string += "<img class=\"store_img\" src=\"" + image + "\" alt=\"Store Image\"  \>"; 
    }
    
    return string; 
}

//clears all existing markers & 
function clearAll() {

    if (locations) {
        locations = [];
    }

    clearMarkers();
}

function clearMarkers() {
    if (markersArray) {
        for (var i = 0; i < markersArray.length; i++) {
            markersArray[i].setMap(null);
        }

        markersArray = [];
    }
}

//return the icon image to be displayed
function iconImage(attr) {
    var color = (attr) ? "red" : "blue";
    return "img/" + color + "_restaurant.png";
}

//return a path for strings
function starImages(total)  {
    var string = "";
    total = Math.round(total);

    for (var i = 0; i < total; i++) {
        string += "<img src='img/star.png' alt='Rating' /> ";
        i++;
    };

    return string;
}