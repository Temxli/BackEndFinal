var apiKey = 'AIzaSyA2SaE0hVuXOTHiDEMZ3pMGKakgako5iB8';

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 51.088753073010125, lng: 71.42456369665425 },
        zoom: 15
    });

    var markerIcon = {
        url: 'location.png',
        scaledSize: new google.maps.Size(30, 30)
    };

    var marker = new google.maps.Marker({
        position: { lat: 51.088753073010125, lng: 71.42456369665425 },
        map: map,
        title: 'University',
        icon: markerIcon
    });

    // Center the map on the marker
    map.setCenter(marker.getPosition());
}

function loadMapScript() {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&callback=initMap';
    document.body.appendChild(script);
}

loadMapScript();
