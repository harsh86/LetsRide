angular.module('maparound.controller', [])


// A simple controller that fetches a list of data
.controller('MapCtrl', function($scope, $timeout, $http,clientlocation, Modal, geocoder) {

  var markerCluster;
  var markerSpider;
  var infoWindow;
  
  $scope.search_form = {location:{}};
  $scope.maxEventsToLoad = 400;

  mixpanel.track("Home Page Loaded");

  $scope.geocodeSearchLocation = function(callback) {

    geocoder.getGeo({address: $scope.search_form.location.address}, function(data){

      if (data) {

        $scope.search_form.location = data;
        $scope.$apply();
        if (callback) callback();

      }

    })

  }

  $scope.setSearchFormLocation = function(location, callback) {

    geocoder.getGeo({'latLng': location}, function(data){
      if (data) {
        $scope.search_form.location = data;
        if (callback) callback();
      }
    })

  }

  $scope.searchForEvents = function() {

    if (!$scope.search_form.location.address) {
      return;
    }

    if (!$scope.search_form.distance) $scope.search_form.distance = 5;

    $scope.geocodeSearchLocation(function(){

//      $scope.closeSearchModal();

      $scope.showLoader = true;
      $scope.loadingText = "Finding Events";
      if(!$scope.$$phase) {
        $scope.$apply();
      }

      mixpanel.track("Searched Events", {
        address: $scope.search_form.location.address
        , keywords: $scope.search_form.keywords ? $scope.search_form.keywords : "None"
        , distance: $scope.search_form.distance ? $scope.search_form.distance : "None"
      });

      eventful.search($scope.search_form, 1, function(events, page_count){
        $scope.$broadcast('eventfulDataChange', {events: events, page_count: page_count});
      });

    });
  }
  
  $scope.resetZoom = function() {
    $scope.$broadcast('resetZoom');
  }

  $scope.setLoaderStatus = function(val) {
    $scope.showLoader = val;
  }

  $scope.setLoadingText = function(val) {
    $scope.loadingText = val;
  }

  $scope.setInfoPartyContent = function(val) {
    $scope.eventInfo = val;
    $scope.$apply();
  }

  $scope.setUserLocation = function(val) {
    $scope.userLocation = val;
  }

  $scope.selectMe = function(elem) {
    elem.select();
  }
//  $scope.openInfoModal = function() {
//    mixpanel.track("Opened info modal");
//    $scope.infoModal.show();
//  };
//
//  $scope.closeInfoModal = function() {
//    mixpanel.track("Closed info modal");
//    $scope.infoModal.hide();
//  }; 
//  $scope.openSearchModal = function() {
//    mixpanel.track("Opened search modal");
//    $scope.searchModal.show();
//  };
//  $scope.closeSearchModal = function() {
//    mixpanel.track("Closed search modal");
//    $scope.searchModal.hide();
//  };

  //Google maps initialisation
  $scope.partyMap = new google.maps.Map(document.getElementById('map-canvas'), {
    center: new google.maps.LatLng(37.09024, -95.7128910),
    zoom: 4,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    panControl: true,
    zoomControl: true,
    scaleControl: true,
    mapTypeControl: true,
    streetViewControl:true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT,
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE]
    }
  });
  
  $scope.partyMarkers = [];
  // Create the search box and link it to the UI element.
  var searchBoxInput = (document.getElementById('pac-input'));
  $scope.partyMap.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBoxInput);

  var searchBox = new google.maps.places.SearchBox((searchBoxInput));
  
  // [START region_getplaces]
  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();

    for (var i = 0, marker; marker = $scope.partyMarkers[i]; i++) {
      marker.setMap(null);
    }

    // For each place, get the icon, place name, and location.
    markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: $scope.partyMap,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      bounds.extend(place.geometry.location);
    }

    $scope.partyMap.fitBounds(bounds);
  });
  // [END region_getplaces]

  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener($scope.partyMap, 'bounds_changed', function() {
    var bounds = $scope.partyMap.getBounds();
    searchBox.setBounds(bounds);
  });
  
  


  $scope.setLoaderStatus(true);
  $scope.setLoadingText("Getting Location");

  clientlocation.get(function(location){

    $scope.initiateMapElements();

    if (location) {

      $scope.partyMap.setCenter(location);
      $scope.setUserLocation(location);

      $scope.setSearchFormLocation(location, function(){
        $scope.partyMap.setZoom(11);
        $scope.searchForEvents();  
      });
    } else {
      mixpanel.track("No client location");
      $scope.setLoaderStatus(false);
      $scope.openSearchModal();
    }

  });

  $scope.$on("resetZoom", function(e, data){
    if ($scope.partyMap) {
      mixpanel.track("Reset Zoom");
      $scope.partyMap.setZoom(11);
    }
  });


  $scope.$on("eventfulDataChange", function(e, data){
    
    var events = data.events;
    var numEventsLoaded = events.length;

    if (!events.length) {
      alert("No events found, try different criteria");
      $scope.openSearchModal();
      return;
    }

    $scope.clearMarkers();
    $scope.clearListeners();
    $scope.placeUserLocationMarker();

    var bounds = $scope.addMarkersToMap(events);

    markerSpider.addListener('click', function(marker, event) {
      $scope.setInfoPartyContent($scope.setPartyInfo(marker.party));
      $scope.openInfoModal();
    });

    var latlng = $scope.search_form.location.latlng;
    $scope.partyMap.panTo(new google.maps.LatLng(latlng[1], latlng[0]));

    if ($scope.partyMarkers.length) {
      // Getting a $digest already in progress error, so I'm just wrapping it in a timeout
      // so it's the last thing on the event queue
      $timeout(function(){
        $scope.partyMap.fitBounds(bounds);
      });
    }
    $scope.setLoaderStatus(false);

//    // Get the rest of the events
//    for(var i = 2; i <= data.page_count; i++) {
//
//      eventful.search($scope.search_form, i, function(events, page_c) {
//
//        numEventsLoaded += events.length;
//
//        if (numEventsLoaded <= $scope.maxEventsToLoad){
//          $scope.addMarkersToMap(events);
//        }
//        
//      });
//    }

  });

  $scope.placeUserLocationMarker = function() {
    if ($scope.userLocation) {
      new google.maps.Marker({
        position: $scope.userLocation
        , icon: new google.maps.MarkerImage('img/client-location.svg', null, null, null, new google.maps.Size(25,25))
        , title: "Your location"
        , map: $scope.partyMap
      });
    } 
  }

  $scope.initiateMapElements = function() {
    if (!markerCluster) {
      var mcOptions = {
        gridSize: 50
        , maxZoom: 15
        , styles: [{
          height: 50
          , width: 50
          , textSize: 14
          , textColor: "#333"
          , url: "img/cluster-icon.png"
        }]
      };
      markerCluster = new MarkerClusterer($scope.partyMap, [], mcOptions);
    }

    if (!infoWindow) {
      infoWindow = new google.maps.InfoWindow();
    }

    if (!markerSpider) {
      var msOptions = {
        keepSpiderfied: true
      }
      markerSpider = new OverlappingMarkerSpiderfier($scope.partyMap, msOptions);
    }
  }

  $scope.clearMarkers = function() {
    for (var i = 0; i < $scope.partyMarkers.length; i++) {
      $scope.partyMarkers[i].setMap(null);
    }
    $scope.partyMarkers = [];
    markerCluster.clearMarkers();
    markerSpider.clearMarkers();
  }

  $scope.clearListeners = function() {
    markerSpider.clearListeners("click");
  }

  $scope.setPartyInfo = function(party) {

    var sD = party.date_time.start_date ? new Date(party.date_time.start_date) : undefined;
    var eD = party.date_time.end_date ? new Date(party.date_time.end_date) : undefined;

    var timeString;
    if (party.date_time.all_day) {
      timeString = 'All day';
    } else if(!sD && !eD) {
      timeString = 'No time specified';
    } else if(!eD) {
      timeString = 'Starts at ' + sD.toFormat("H:MI P") + '<br>' + sD.toFormat("MMM D, YYYY");
    } else {
      timeString = sD.toFormat("H:MI P") + ' to ' + eD.toFormat("H:MI P") + '<br>' + sD.toFormat("MMM D, YYYY");
    }

    party.timeString = timeString;
    party.description = (party.description ? party.description : "No description provided");

    return party;
  }

  $scope.addMarkersToMap = function(parties) {

    var bounds = new google.maps.LatLngBounds();

    angular.forEach(parties, function(party){
      var ll = new google.maps.LatLng(party.location.latlng[1], party.location.latlng[0]);

      var marker = new google.maps.Marker({
        position: ll
        , icon: new google.maps.MarkerImage('img/marker.svg', null, null, null, new google.maps.Size(40,40))
        , title: party.name
      });

      marker.party = party;
      markerSpider.addMarker(marker);
      $scope.partyMarkers.push(marker);

      bounds.extend(ll);
            
    });

    markerCluster.addMarkers($scope.partyMarkers);

    return bounds;
  }
  
})
