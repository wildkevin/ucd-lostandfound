function initMap() {
    var myLatlng = {lat: 38.537, lng: -121.754};
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 14, center: myLatlng});
    var geocoder = new google.maps.Geocoder;
    var marker = new google.maps.Marker({
            position: myLatlng,
            map: map
            });
    geocoder.geocode({'location': myLatlng}, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                console.log(results[0].formatted_address)
                document.getElementById("location").value = results[0].formatted_address
                } else {
                alert('No results found');
                }
            } else {
                alert('Geocoder failed due to: ' + status);
            }
        });

    // Configure the click listener.
    map.addListener('click', function(mapsMouseEvent) {
        let new_point = mapsMouseEvent.latLng
        marker.setPosition(new_point)
        geocoder.geocode({'location': new_point}, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    marker.setPosition(new_point)
                    console.log(results[0].formatted_address)
                    document.getElementById("location").value = results[0].formatted_address
                    } else {
                    alert('No results found');
                    }
                } else {
                    alert('Geocoder failed due to: ' + status);
                }
            });
    });
}