function GoogleMap(){
    
    this.initialize = function(){
        var map = showMap();
        addMarkersToMap(map);
    }
    
    var addMarkersToMap = function(map){
        var mapBounds = new google.maps.LatLngBounds();
        
        var latitudeAndLongitudeOne = new google.maps.LatLng('-33.890542','151.274856');
        
        var markerOne = new google.maps.Marker({
                                               position: latitudeAndLongitudeOne,
                                               map: map
                                               });
        
        var latitudeAndLongitudeTwo = new google.maps.LatLng('57.77828', '14.17200');
        
        var markerOne = new google.maps.Marker({
                                               position: latitudeAndLongitudeTwo,
                                               map: map
                                               });
        
        mapBounds.extend(latitudeAndLongitudeOne);
        mapBounds.extend(latitudeAndLongitudeTwo);
        
        map.fitBounds(mapBounds);
    }
    
    function getRealContentHeight() {
        var header = $.mobile.activePage.find("div[data-role='header']:visible");
        var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
        var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
        var viewport_height = $(window).height();
     
        var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
        if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
            content_height -= (content.outerHeight() - content.height());
        } 
        return content_height;
    }
    
    function getRealContentWidth() {
        var header = $.mobile.activePage.find("div[data-role='header']:visible");
        var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
        var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
        var viewport_width = $(window).width();
     
        var content_width = viewport_width - header.outerWidth() - footer.outerWidth();
        if((content.outerWidth() - header.outerWidth() - footer.outerWidth()) <= viewport_width) {
            content_width -= (content.outerWidth() - content.width());
        } 
        return content_width;
    }
    
    
    
    var showMap = function(){
        var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(-33, 151),
        mapTypeId: google.maps.MapTypeId.ROADMAP
        
        }

        var $content = $(" div:jqmData(role=content)");
       $content.height (screen.height);
       $content.width(screen.width);	
        var map = new google.maps.Map ($content[0], mapOptions);
        
       
        
        return map;
    }
    // Resize stuff...
    var resizeTimeout; 
    google.maps.event.addDomListener(window, "resize", function() {
    	if (resizeTimeout) { 
    		clearTimeout(resizeTimeout); 
    	} 
    	resizeTimeout = setTimeout(function() 
    			{ /* do resizing */ }, 250); });
}