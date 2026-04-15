// type,route,east,north,speed,na,busnr,na,na

async function getLocation(nbus) {
    const lat = parseInt(nbus[3]) / 1000000;
    const long = parseInt(nbus[2]) / 1000000;
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;

    try {
        const response = await fetch(url, {
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        });
        if (!response.ok) {
            console.error(`Error getting location from ${nbus[1]}, location ${lat}, ${long}`);
            return null;
        }
         const data = await response.json();
        return data.results[0]?.name || "Unknown location";
    } catch (err) {
        console.error("Fetch error:", err);
        return null;
    }
}

const parse = async (data) => {
    let split = data.split("\n");
    let trolleybuses = {};
    let buses = {};
    let boats = {};
    
    const locationPromises = split.map(async (bus) => {
        const nbus = bus.split(",");
        const location = await getLocation(nbus);
        return { nbus, location };
    });

    const resolved = await Promise.all(locationPromises);

    for (const { nbus, location } of resolved) {

        if (nbus[0] == 1) {
            // trolleybus
            if (!trolleybuses.hasOwnProperty(nbus[1])) {
                trolleybuses[nbus[1]] = [];
            }

            trolleybuses[nbus[1]].push({
                busnr: nbus[5],
                speed: nbus[4],
                location: location,
                mapurl: `${window.location.origin}/map.html?lat=${nbus[3]}&long=${nbus[2]}&route=${nbus[1]}`
            });
        } else if (nbus[0] == 2) {
            // boat
            if (nbus[1].startsWith("L")) {
                if (!boats.hasOwnProperty(nbus[1])) {
                    boats[nbus[1]] = [];
                }

                boats[nbus[1]].push({
                    busnr: nbus[5],
                    speed: nbus[4],
                    location: location,
                    mapurl: `${window.location.origin}/map.html?lat=${nbus[3]}&long=${nbus[2]}&route=${nbus[1]}`
                });
            } else {
                // bus
                if (!buses.hasOwnProperty(nbus[1])) {
                    buses[nbus[1]] = [];
                }

                buses[nbus[1]].push({
                    busnr: nbus[5],
                    speed: nbus[4],
                    location: location,
                    mapurl: `${window.location.origin}/map.html?lat=${nbus[3]}&long=${nbus[2]}&route=${nbus[1]}`
                });
            }

            /*buses.push({
                type: nbus[0] == 1 ? "Trolleybus" : "Bus",
                route: nbus[1],            
                north: (parseInt(nbus[3]) / 1000000).toString(),
                east: (parseInt(nbus[2]) / 1000000).toString(),
                speed: nbus[4],
                busnr: nbus[5]
            });*/
        }
    }

    return [trolleybuses, buses, boats];
};

let trolleybus = document.getElementById("trolleybus");
let bus = document.getElementById("bus");
let boat = document.getElementById("boat");

const updateList = async (data) => {
    const [trolleybuses, buses, boats] = await parse(data);
    console.log(trolleybuses, buses, boats);
    
    Object.entries(trolleybuses).forEach(([key, value]) => {
        let details = document.createElement("details");
        details.id = "route";

        let summary = document.createElement("summary");
        summary.innerText = "Route " + key + ` (amount of trolleybuses driving this route: ${value.length})`;
        details.appendChild(summary);
        
        let ul = document.createElement("ul");

        value.forEach(_trolleybus => {
            let li = document.createElement("li");
            let url = document.createElement("a");
           
            li.innerText = `Trolleybus nr. ${_trolleybus.busnr} | Speed: ${_trolleybus.speed} km/h | Location: ${_trolleybus.location} |`;
            li.innerHTML += "<br>"
            
            url.href = _trolleybus.mapurl;
            url.innerText = "Trolleybus on map";

            li.appendChild(url);
            ul.appendChild(li);
        });
        details.appendChild(ul);
        trolleybus.appendChild(details);
    });
    
    Object.entries(buses).forEach(([key, value]) => {
        let details = document.createElement("details");
        details.id = "route";

        let summary = document.createElement("summary");
        summary.innerText = "Route " + key + ` (amount of buses driving this route: ${value.length})`;
        details.appendChild(summary);
        
        let ul = document.createElement("ul");

        value.forEach(_bus => {
            let li = document.createElement("li");
            let url = document.createElement("a");
            
            li.innerText = `Bus nr. ${_bus.busnr} | Speed: ${_bus.speed} km/h | Location: ${_bus.location} |`;
            li.innerHTML += "<br>"
            
            url.href = _bus.mapurl;
            url.innerText = "Bus on map";
            
            li.appendChild(url);
            ul.appendChild(li);
        });
        details.appendChild(ul);
        bus.appendChild(details);
    });

    Object.entries(boats).forEach(([key, value]) => {
        let details = document.createElement("details");
        details.id = "route";

        let summary = document.createElement("summary");
        summary.innerText = "Route " + key + ` (amount of boats driving this route: ${value.length})`;
        details.appendChild(summary);
        
        let ul = document.createElement("ul");

        value.forEach(_bus => {
            let li = document.createElement("li");
            let url = document.createElement("a");
            
            li.innerText = `Boat nr. ${_bus.busnr} | Speed: ${_bus.speed} km/h | Location: ${_bus.location} |`;
            li.innerHTML += "<br>"
            
            url.href = _bus.mapurl;
            url.innerText = "Bus on map";
            
            li.appendChild(url);
            ul.appendChild(li);
        });
        details.appendChild(ul);
        boat.appendChild(details);
    });


};

const refetch = async () => {
    trolleybus.innerHTML = `<summary>
            Trolleybuses
        </summary>
`;
    bus.innerHTML = `<summary>
            Buses
        </summary>
`;
    boat.innerHTML = `<summary>
            Boats
        </summary>
`;


    fetch("https://corsproxy.io?url=" + encodeURIComponent("https://www.stops.lt/vilnius/gps.txt"))
    .then(async response => {
        if (!response.ok) {
            console.log(response);
        }
        return response.text();
    })
    .then(async response => {
        await updateList(response);
    });
};

refetch();

document.querySelector("button").onclick = refetch;
