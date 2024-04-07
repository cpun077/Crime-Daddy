function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // Display the user's location for debugging purposes
    let locationHtml = `Your Location: Latitude: ${latitude}, Longitude: ${longitude}<br>`;
    document.getElementById("location").innerHTML = locationHtml;

    fetch('http://localhost:5000/check-crimes', {  // Make sure this URL matches your Flask app's URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
    })
    .then(response => response.json())
    .then(data => {
        // Append crime data to the user's location information
        let crimesHtml = data.crimes.map(crime =>
            `<li>${crime.incident_description} at ${crime.latitude}, ${crime.longitude}</li>`  // Adjust based on your crime data structure
        ).join('');
        document.getElementById("location").innerHTML += `<ul>${crimesHtml}</ul>`;
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById("location").innerHTML += `Error fetching crimes: ${error}`;
    });
}


function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById("location").innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("location").innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            document.getElementById("location").innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById("location").innerHTML = "An unknown error occurred."
            break;
    }
}
