	// Note: This example requires that you consent to location sharing when
	// prompted by your browser. If you see a blank space instead of the map, this
	// is probably because you have denied permission for location sharing.
		var directionsDisplay;
		var directionsService = new google.maps.DirectionsService();
	
		var map, infowindow, request, heatmap, pointarray, results, status, inputZip;		
		var tacoData = [];		
		var radiusDistance = 0;		
		var mapType = "roadmap";
	
		function initialize() {				
			
				//radiusDistance = location.search.split('distParam=')[1];

				if(radiusDistance === null || radiusDistance === 0 || radiusDistance === undefined){
							radiusDistance = 4828;
						}
				  
				  if(radiusDistance >= 120701){
				  	
				  	var mapOptions = {
						zoom: 10,						
					  };
					  map = new google.maps.Map(document.getElementById('map-canvas'),
						  mapOptions);
						  
						map.setMapTypeId(mapType);
						
						if(mapType == "roadmap"){
							map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
						}else{
							map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
						}
						  
						var pointArray = new google.maps.MVCArray(tacoData);
						
						  heatmap = new google.maps.visualization.HeatmapLayer({
						    data: pointArray
						  });
						  
						  findCurrentLocationForHeatmap();

				  }else{
				  	
	   			  	  directionsDisplay = new google.maps.DirectionsRenderer();
					
					  var mapOptions = {
						zoom: 13,
						mapTypeId: mapType
					  };
					  map = new google.maps.Map(document.getElementById('map-canvas'),
						  mapOptions);
						  
					  directionsDisplay.setMap(map);
					  findCurrentLocation();
				  }			
			}

			function findCurrentLocation(){
				
				try{
					if (navigator.geolocation) {
						 navigator.geolocation.getCurrentPosition(function (position) {
							 pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
							 map.setCenter(pos);
							 findTexMex(pos);
						 });
					 }
				}catch(err){
					var modalBodyContentHtml = "<br><br>Oh crap, I couldn't find your location. It's likely your Geo-Location features are turned off. Put in a zip code, and we'll look for some tacos."
											+ "<br><hr><div class='form-group'>"
											+ "<label for='inputZip' class='col-lg-2 control-label'>Zip Code</label>"
											+ "<input type='text' class='form-control' id='inputZip' placeholder='90210'  maxlength='5' minxlength='5'>"
											+ "</div></div>";
											
					$("#findLatLngBtn").show();	
											
					$("#modalBodyContent").html(modalBodyContentHtml);
					$("#tacoModal").modal();
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
			
			var newLocation;
			
			function findSpecificTexMex(thisEndPoint){
				var request = {
								location: pos,				
								radius: radiusDistance,
								types: ['food'],
								sensor: true,
								rankby: google.maps.places.RankBy.DISTANCE,
								keyword: ['mexican || burrito || taco || azteca || latin']
							  };
			  
				if (infowindow) {
					infowindow.close();
				}
			  
			  infowindow = new google.maps.InfoWindow();
			  var service = new google.maps.places.PlacesService(map);
			 			  
			  newLocation = new google.maps.LatLng(thisEndPoint.attributes[1].value, thisEndPoint.attributes[2].value);
			  			  
			  service.nearbySearch(request, specificCallback);
			}
			
			function specificCallback(results) {

				for (var i = 0; i < results.length; i++) {
					createMarker(results[i]);
				}

				var newEndPoint = newLocation;
				calcRoute(pos, newEndPoint);				
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
					var resultsLength = results.length;
					
						var tacoPlaceResults = results.length ;
						if(tacoPlaceResults > 0){
							var randomTacoPlace = Math.floor(Math.random() * tacoPlaceResults) - 1;
							
							try{
								var newEndPoint = results[randomTacoPlace].geometry.location;
							}catch(err){
								var newEndPoint = results[0].geometry.location;
							}
							
							calcRoute(pos, newEndPoint);
						}else{
							$("#modalBodyContent").html("<br><br>Oh crap, I couldn't find any taco places nearby.<br><br>");
							$("#tacoModal").modal();
						}
				}else if(radiusDistance >= 120701){
					
					for (var i = 0; i < results.length; i++) {	
						tacoData[i] = results[i].geometry.location;
					}
					heatmap.setMap(map);
					
				}else{
			 	//Make a popover
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

			  var rating;
			  
			  if(!place.rating){
				rating = "?";
			  }else{
				rating = place.rating;
			  }
			  
			  var locationInfoA = place.geometry.location.A;
			  var locationInfoF = place.geometry.location.F;
			  var locationInfo = "<span class='newDirectionsLink' attr-a='"
								+ locationInfoA
								+ "' "
								+ "attr-f='"
								+ locationInfoF
								+ "' onclick='findSpecificTexMex(this);'>Get Directions</span>";
			  
			  var restaurantInfo = ('<strong>' + place.name + '</strong> (<strong>' + rating + '</strong>/5) <br />' + place.vicinity + '<br />' + locationInfo +  '<hr>' + 'On a scale of 1 to 5 how pricey is it? ' + place.price_level + '<br />');
			  
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
				  
				  createDirectionSteps(response);
				}
			  });
			}
			
			function createDirectionSteps(response){
				
				var directionHtml = "";
				
				$.each(response.routes[0].legs[0].steps, function( index, value ) {
					directionHtml += value.instructions;
					directionHtml += "<br>";
				});
				$("#directionHolder").html(directionHtml);
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
			
			$(function(){
			
				//Initialize material
				$.material.init()
			
				var mapResizeHeight, mapResizeWidth;
			  
				$("#includedContent").load("includes/navbar.html");

				$( window ).resize(function() {
					resizeMap();			  
				});
				
				$("#inputZip").on('change', function(){
					inputZip = $("#inputZip").val();					
				});
				
				/*
				$("#distanceSlider").noUiSlider({
					start: 40,
					step: 20,
					behaviour: 'tap-drag',
					connect: 'upper',
					range: {
						'min':  0,
						'max':  100
					}
				});
				*/
				
				$("#distanceSlider").noUiSlider({
					start: [ 4828 ],
					range: {
						'min': [  804 ],
						'30%': [  4828 ],
						'70%': [  8046 ],
						'max': [ 40233 ]
					}
				});
				//$("#distanceSlider").Link('lower').to('-inline-');
				$('#distanceSlider').on('slide', onSlide);
				$('#distanceSlider').on('set', onSet);

				resizeMap();
			});

			function handleclick() { 
				return false;
			}

			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

			ga('create', 'UA-51726879-1', 'ryanguthridge.com');
			ga('send', 'pageview');
			
			function resizeMap(){
				mapResizeHeight = $( window ).height() - 100;
				mapResizeWidth = $("#right-pane").width() - 24;

				$("#right-pane").height(mapResizeHeight);
				//$("#left-pane").height(mapResizeHeight);
				$("#wrapper").height(mapResizeHeight);
				$("#wrapper").width(mapResizeWidth);
				
				if ($( window ).width() < 992) {
					$("#right-pane").css( "margin-left", "40px" );
				}else{
					$("#right-pane").css( "margin-left", "0px" );
				}
			}
			
			function onSlide(){
				radiusDistance = $("#distanceSlider").val();
				
				var metersToMiles = radiusDistance * 0.000621371;
				metersToMiles = Math.round(metersToMiles * 100) / 100;
				metersToMilesHtml = metersToMiles + " miles";
				
				$("#distanceSliderValue").html(metersToMilesHtml);
			}
			
			function onSet(){
				initialize();
			}
			
			function radioClick(elem){
				mapType = elem.value;
				//initialize();
				
				if(mapType == "roadmap"){
					map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
				}else{
					map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
				}
			}
			
			function findLatLng(){
				
				inputZip = $("#inputZip").val();				
				var inputZipLength = inputZip.length;

				if(inputZipLength == 5){
					
					$("#findLatLngBtn").hide();
					$("#tacoModal").modal('hide');
					
					$.ajax({
					   url : "http://maps.googleapis.com/maps/api/geocode/json?components=postal_code:"+inputZip+"&sensor=false",
					   method: "POST",
					   success:function(data){
							latitude = data.results[0].geometry.location.lat;
							longitude= data.results[0].geometry.location.lng;
						   
							pos = new google.maps.LatLng(latitude, longitude);
							map.setCenter(pos);
							findTexMex(pos);
					   }
					});
				}
			}
			
			google.maps.event.addDomListener(window, 'load', initialize);
