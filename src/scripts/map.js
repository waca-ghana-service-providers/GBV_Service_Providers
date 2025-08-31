document.addEventListener("DOMContentLoaded", function () {
    // Initialize the map 
    var map = L.map("map").setView(config.mapCenter, config.initialZoom);

    // Add tile layers to the map 
    var tileLayers = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
        "ESRI Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }),
        "Google Maps": L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© Google Maps'
        }),
        "Google Satellite": L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© Google Maps'
        }),
    };

    // Add the default ESRI Satellite layer
    tileLayers["ESRI Satellite"].addTo(map);

    // Create a layer control
    L.control.layers(tileLayers, null, { position: 'bottomleft'} ).addTo(map);

    // Add scale bar 
    L.control.scale({ position: 'bottomright' }).addTo(map);

    // Export the map instance if needed by other modules 
    window.map = map;
})