	// Note: This example requires that you consent to location sharing when
	// prompted by your browser. If you see a blank space instead of the map, this
	// is probably because you have denied permission for location sharing.
		var directionsDisplay;
		var directionsService = new google.maps.DirectionsService();
	
		var map, infowindow, request, heatmap, pointarray;
		
		var tacoData = [];
		
		var radiusDistance = 0;
		
		if(radiusDistance === null || radiusDistance === "undefined"){
			radiusDistance = 4828;
		}

		function initialize() {
			
				radiusDistance = location.search.split('distParam=')[1];
				  
				  if(radiusDistance >= 120701){
				  	
				  	var mapOptions = {
						zoom: 10,
						mapTypeId: google.maps.MapTypeId.SATELLITE
					  };
					  map = new google.maps.Map(document.getElementById('map-canvas'),
						  mapOptions);
						  
						var pointArray = new google.maps.MVCArray(tacoData);
						
						  heatmap = new google.maps.visualization.HeatmapLayer({
						    data: pointArray
						  });
						  
						  findCurrentLocationForHeatmap();
						  
						  
				  }else{
				  	
	   			  	  directionsDisplay = new google.maps.DirectionsRenderer();
					
					  var mapOptions = {
						zoom: 13
					  };
					  map = new google.maps.Map(document.getElementById('map-canvas'),
						  mapOptions);
						  
					  directionsDisplay.setMap(map);
					  findCurrentLocation();
				  }			
			}

			function findCurrentLocation(){
				if (navigator.geolocation) {
					 navigator.geolocation.getCurrentPosition(function (position) {
						 pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
						 map.setCenter(pos);
						 findTexMex(pos);
					 });
				 }
			}
			
			function findCurrentLocationForHeatmap(){
				if (navigator.geolocation) {
					 navigator.geolocation.getCurrentPosition(function (position) {
						 pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
						 map.setCenter(pos);
						 findTacoPlacesForHeatmap(pos);
					 });
				 }
			}

			function findTexMex(){
				var request = {
				location: pos,				
				radius: radiusDistance,
				types: ['food'],
				sensor: true,
				rankby: google.maps.places.RankBy.DISTANCE,
				keyword: ['mexican || burrito || taco || azteca || latin']
			  };
			  infowindow = new google.maps.InfoWindow();
			  var service = new google.maps.places.PlacesService(map);
			  service.nearbySearch(request, callback);
			}
			
			function findTacoPlacesForHeatmap(){
				var request = {
				location: pos,				
				radius: radiusDistance,
				types: ['food'],
				sensor: true,
				keyword: ['mexican || burrito || taco || azteca || latin']
			  };
			  infowindow = new google.maps.InfoWindow();
			  var service = new google.maps.places.PlacesService(map);
			  //service.nearbySearch(request, callback);
			  service.radarSearch(request, callback);
			}

			function callback(results, status) {					
				if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0 && radiusDistance < 120701 ) {
					for (var i = 0; i < results.length; i++) {
						createMarker(results[i]);
					}
					var tacoPlaceResults = results.length ;
					var randomTacoPlace = Math.floor(Math.random() * tacoPlaceResults) - 1;
					var newEndPoint = results[randomTacoPlace].geometry.location;
					calcRoute(pos, newEndPoint);
					
				}else if(radiusDistance >= 120701){
					
					for (var i = 0; i < results.length; i++) {	
						tacoData[i] = results[i].geometry.location;
					}
					heatmap.setMap(map);
					
				}else{
			 	$( "#dialog" ).dialog( "open" );
			 }
			}

			function createMarker(place) {
			  var placeLoc = place.geometry.location;
			  var image = 'images/taco.png';
			  var marker = new google.maps.Marker({
				map: map,
				position: place.geometry.location,
				icon: image
			  });

			  var restaurantInfo = (place.name + '<br />' + place.vicinity + '<hr>' + 'On a scale of 1 to 5 how pricey is it? ' + place.price_level + '<br />');
			  
			  google.maps.event.addListener(marker, 'click', function() {
				infowindow.setContent(restaurantInfo);
				infowindow.open(map, this);
			  });
			}
			
			function calcRoute(pos, newEndPoint) {
			  var start = pos;
			  var end = newEndPoint;
			  var request = {
				  origin:start,
				  destination:end,
				  travelMode: google.maps.TravelMode.DRIVING
			  };
			  directionsService.route(request, function(response, status) {
				if (status === google.maps.DirectionsStatus.OK) {
				  directionsDisplay.setDirections(response);
				}
			  });
			}
			
			function handleNoGeolocation(errorFlag) {
				  if (errorFlag) {
					var content = 'Error: The Geolocation service failed.';
				  } else {
					var content = 'Error: Your browser doesn\'t support geolocation.';
				  }

			  var options = {
				map: map,
				position: new google.maps.LatLng(60, 105),
				content: content
			  };

			  var infowindow = new google.maps.InfoWindow(options);
			  map.setCenter(options.position);
			}
			
			google.maps.event.addDomListener(window, 'load', initialize);
