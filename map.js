const apikey = "AIzaSyAzzTZR_VFHD02bTGOkaZtRJxr_hzdCy2E";

const urlParams = new URLSearchParams(window.location.search);

if (!window.location.href.includes("?")) {
    window.location.href = "/";
}

let lat, long, route;

if (window.location.search.indexOf("lat") !== -1 && window.location.search.indexOf("long") !== -1 && window.location.search.indexOf("route") !== -1) {
    lat = parseInt(urlParams.get("lat")) / 1000000;
    long = parseInt(urlParams.get("long")) / 1000000;
    route = parseInt(urlParams.get("route")) / 1000000;
} else {
    window.location.href = "/";
}


let map;

async function initMap() {
    // The location of Uluru
    const position = { lat: lat, lng: long };
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
        zoom: 13,
        center: position,
        mapId: "DEMO_MAP_ID",
    });

    // The marker, positioned at Uluru
    const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: `Route ${route}`,
  });
}

initMap();

