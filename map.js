const urlParams = new URLSearchParams(window.location.search);

if (!window.location.href.includes("?")) {
    window.location.href = "/";
}

let lat, long, route;

if (window.location.search.indexOf("lat") !== -1 && window.location.search.indexOf("long") !== -1 && window.location.search.indexOf("route") !== -1) {
    lat = parseInt(urlParams.get("lat")) / 1000000;
    long = parseInt(urlParams.get("long")) / 1000000;
    route = parseInt(urlParams.get("route"));
} else {
    window.location.href = "/";
}


let map;

async function initMap() {
    
    map = L.map('map').setView([lat, long], 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let marker = L.marker([lat, long]).addTo(map);
    marker.bindPopup(`Route <b>${route}</b>`).openPopup();
}

initMap();

