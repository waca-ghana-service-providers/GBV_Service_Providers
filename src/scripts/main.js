// Mobile Panel Management
function initMobileUI() {
    const toggleControlsBtn = document.getElementById('toggle-controls');
    const toggleStatsBtn = document.getElementById('toggle-stats');
    const controlsPanel = document.getElementById('controls-panel');
    const statsPanel = document.getElementById('stats-panel');
    
    // Create close buttons dynamically
    function createCloseButton(panel, isLeftPanel = false) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'panel-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '15px';
        closeBtn.style[isLeftPanel ? 'left' : 'right'] = '15px';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.background = 'rgba(12, 186, 163, 0.2)';
        closeBtn.style.border = 'none';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
        closeBtn.style.zIndex = '1003';
        closeBtn.style,boxShadow = '0 2px 5px rgba(12, 186, 163, 0.2)';
        closeBtn.style.transform = 'rotate(0deg)';
        closeBtn.addEventListener('click', () => panel.classList.remove('active'));
        closeBtn.addEventListener('mouseover', () => {
            closeBtn.style.transform = 'rotate(90deg)';
            closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.background = '#f07167';
        });
        closeBtn.addEventListener('mouseout', () => {
            closeBtn.style.backgroundColor = 'transparent';
            closeBtn.style.transform = 'rotate(0deg)';
            closeBtn.style.background = 'rgba(12, 186, 163, 0.2)';
        })
        panel.prepend(closeBtn);
    }
    
    if (controlsPanel && statsPanel) {
        createCloseButton(controlsPanel);
        createCloseButton(statsPanel, true);
        
        // Toggle functions
        const togglePanel = (panelToShow, panelToHide) => {
            panelToShow.classList.add('active');
            panelToHide.classList.remove('active');
            document.body.style.overflow = 'hidden';
        };
        
        if (toggleControlsBtn) {
            toggleControlsBtn.addEventListener('click', () => togglePanel(controlsPanel, statsPanel));
        }
        
        if (toggleStatsBtn) {
            toggleStatsBtn.addEventListener('click', () => togglePanel(statsPanel, controlsPanel));
        }
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const isClickInsidePanel = controlsPanel.contains(e.target) || 
                                          statsPanel.contains(e.target) ||
                                          e.target === toggleControlsBtn || 
                                          e.target === toggleStatsBtn;
                
                if (!isClickInsidePanel) {
                    controlsPanel.classList.remove('active');
                    statsPanel.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }
}

// Mobile UI Controls
document.addEventListener('DOMContentLoaded', function() {  
    // Initialize mobile UI
    initMobileUI();

    // Initialize variables 
    var currentLanguage = localStorage.getItem('gbvMapLanguage') || 'en';
    // var filteredMarkers = L.markerClusterGroup();
    var routingControl = null;
    var currentPositionMarker = null
    var serviceData = null;
    var markers = null; // Keep track of markers

    // Initialize the UI 
    initUI()

    // Load data
    loadDistrictData();
    // Add legend 
    createServiceLegend();
    // Load service provider data
    loadServiceProviderData();

    // Function to start the user interface if not already started
    function initUI() {
        setupEventListeners();
   
        // Initialize checkboxes
        document.getElementById('filter-health').checked = true;
        document.getElementById('filter-education').checked = false;
        document.getElementById('filter-legal').checked = false;
        document.getElementById('filter-law-enforcement').checked = false;
        document.getElementById('filter-government-and-municipal').checked = false;
        document.getElementById('filter-social-welfare').checked = false;
        document.getElementById('filter-child-and-youth-support-ngos').checked = false;
    }

    // Function to set up event listeners for UI elements
    function setupEventListeners() {
        // Filter checkboxes 
        document.querySelectorAll('.filter-option input').forEach(function(checkbox) {
            checkbox.addEventListener('change', function() {
                if (serviceData) updateMarkers();
            });
        });

        // Search input 
        document.getElementById('search-input').addEventListener('input', function(e) {
            if (serviceData) handleSearchInput(e.target.value);
        });

        // Clear route button 
        document.getElementById('clear-route').addEventListener('click', clearRoute);
    }

    // Function to load service provider data
    function loadServiceProviderData(){
        fetch(config.providerDataPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // console.log("Data loaded successfully:", data);
                serviceData = data;
                document.getElementById('loading-indicator').style.display = 'none';
                updateMarkers();
                setupCharts();
                updateInstitutionCount();
            })
            .catch(error => {
                console.error("Error loading the geojson file:", error);
                document.querySelector("#loading-indicator p").textContent = 'Error loading the geojson file. Please try again later.';
            });
    } 

    // Function to load district data
    function loadDistrictData() {
        fetch(config.districtDataPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const districtData = data;
                // Hide loading indicator if needed
                document.getElementById('loading-indicator').style.display = 'none';
                
                // Add the district data to the map as a GeoJSON layer
                L.geoJSON(districtData, {
                    style: function(feature) {
                        return {
                            color: "#3388ff", // outline color
                            weight: 2,
                            fillOpacity: 0.2 // adjust opacity as needed
                        };
                    },
                    onEachFeature: function(feature, layer) {
                        // Optionally bind a popup or other event listeners
                        if (feature.properties && feature.properties.DIST_NAME) {
                            layer.bindPopup(feature.properties.DIST_NAME);
                        }
                    }
                }).addTo(map);
            })
            .catch(error => {
                console.error("Error loading the geojson file:", error);
                document.querySelector("#loading-indicator p").textContent = 'Error loading the geojson file. Please try again later.';
            });
    }
    
    // Function to count service types
    function countServiceTypes() {
        if (!serviceData || !serviceData.features) return {};
        
        const counts = {};
        
        serviceData.features.forEach(feature => {
            const serviceType = feature.properties.Type_of_service;
            if (serviceType) {
                // Clean and standardize the service type
                const cleanType = toTitleCase(serviceType.trim()); 
                counts[cleanType] = (counts[cleanType] || 0) + 1;
            }
        });
        
        return counts;
    }


    // Function to convert string to title case while preserving acronyms
    function toTitleCase(str) {
        // Define common acronyms to preserve exactly as shown
        const acronyms = ['NGOs', 'NGO'];
        const acronymsMap = {};
        
        // Create case-insensitive lookup map
        acronyms.forEach(acronym => {
          acronymsMap[acronym.toUpperCase()] = acronym;
        });
        
        return str.replace(/\b\w+\b/g, function(word) {
          // Check if it's in the acronyms list (case-insensitive match)
          const upperWord = word.toUpperCase();
          if (acronymsMap[upperWord]) {
            return acronymsMap[upperWord];
          }
          
          // Apply title case to normal words
          return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
        });
      }

    // Function to set up the chart
    function setupCharts() {
        const typeCounts = countServiceTypes();
        // Convert the object into an array and sort by count (descending)
        const sortedEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
        // Extract sorted labels and data - no splitting needed here
        const labels = sortedEntries.map(entry => entry[0]);
        const data = sortedEntries.map(entry => entry[1]);
        // console.log("Sorted entries:", labels);

        // Define a colour scheme
        const backgroundColours = labels.map(label => {
            const colourConfig = config.legendIcons[label] || { colour: '#735751' }; // Default colour if not found
            return colourConfig.colour;
        })

        var ctx = document.getElementById('stats-chart').getContext('2d');
        var chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    // backgroundColor: ['#4E79A7', '#E15759', "#59A14F", '#F28E2B', '#B07AA1', '#FF9DA7', '#9C755F'],
                    backgroundColor: backgroundColours,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: { beginAtZero: true },
                    y: {
                        ticks: {
                            autoSkip: false,
                            callback: function(value, index) {
                                // Get the label text
                                const label = this.getLabelForValue(value);
                                // Split the label into words
                                const words = label.split(' ');
                                // Create lines with maximum 2 words per line
                                const lines = [];
                                for (let i = 0; i < words.length; i += 3) {
                                    lines.push(words.slice(i, i + 3).join(' '));
                                }
                                return lines;
                            },
                            font: {
                                size: 12
                            }
                        },
                        afterFit: function(scale) {
                            // Increase scale width to accommodate wrapped labels
                            scale.width = Math.max(scale.width, 200);
                        }
                    }
                },
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                // Return the original label without wrapping for tooltips
                                return labels[tooltipItems[0].dataIndex];
                            }
                        }
                    }
                }
            }
        });
    }


    // This function updates the institution count displayed in the UI
    function updateInstitutionCount() {
        if (!serviceData || !serviceData.features) return;

        const totalInstitutions = serviceData.features.length;
        document.getElementById('institution-count-value').textContent = totalInstitutions
    }



    // This function generates the HTML content for the popup that appears when a marker is clicked
    function createPopupContent(feature, lang) {
        // Safely access properties with optional chaining and default values
        const properties = feature.properties || {};
        
        // Handle image path
        const imagePath = properties.Photo_of_facility 
            ? `${config.imagePath}${properties.Photo_of_facility}` 
            : '';
        
        // Create image content with fallback
        const imageContent = properties.Photo_of_facility 
            ? `
            <img src="${imagePath}" 
                 alt="${properties.SP_Name || 'Service Provider'}" 
                 onerror="this.onerror=null; this.replaceWith(createFallBackImage('${lang.imageError}'))">
            ` 
            : createFallBackImage(lang.imageError);
    
        // Handle multilingual names and addresses
        // const name = (currentLanguage === 'ee' && properties.name_ewe) 
        //     ? properties.name_ewe 
        //     : properties.SP_Name || 'Unknown';
        
        // const address = (currentLanguage === 'ee' && properties.address_ewe)
        //     ? properties.address_ewe
        //     : properties.Physical_Address || 'No address available';
        
        // const services = (currentLanguage === 'ee' && properties.services_ewe)
        //     ? properties.services_ewe
        //     : properties.Services || 'No services listed';
        
        const name = properties.SP_Name || 'Unknown Service Provider';
        const address = properties.Physical_Address || 'No address available';
        const services = properties.Services || 'No services listed';
    
        return `
        <div class="provider-popup">
            <h3><b>${name}</b></h3>
            <p><strong>${lang.address}:</strong> ${properties.Physical_Address}</p>
            <p><strong>${lang.contact}:</strong> ${properties.Telephone || 'N/A'}</p>
            ${properties.SP_Email 
                ? `<p><strong>${lang.email}: </strong><a href="mailto:${properties.SP_Email}">${properties.SP_Email || 'Not available'}</a></p>` 
                : ''}
            <p><strong>${lang.services}:</strong> ${services}</p>
            <p><strong>${lang.hours}:</strong> ${properties.Working_hours || 'Not specified'}</p>
            ${imageContent}
            ${feature.geometry && feature.geometry.coordinates 
                ? `<button class="get-directions" 
                          data-lat="${feature.geometry.coordinates[1]}" 
                          data-lng="${feature.geometry.coordinates[0]}">
                    ${lang.getDirections}
                    </button>`
                : ''}
        </div>
        `;
    }

    // This function clears existing markers and adds new ones based on the current filter settings
    // and the loaded service data
    function updateMarkers() {
        // Clear existing markers completely
        if (markers) {
            map.removeLayer(markers);
            markers.clearLayers();
        }
        
        // Create a new marker cluster group
        markers = L.layerGroup();
       
        
        // Get filter settings
        var showHealth = document.getElementById('filter-health').checked;
        var showEducation = document.getElementById('filter-education').checked;
        var showLegal = document.getElementById('filter-legal').checked;
        var showLawEnforcement = document.getElementById('filter-law-enforcement').checked;
        var showGovernmentAndMunicipal = document.getElementById('filter-government-and-municipal').checked;
        var showChildAndYouth = document.getElementById('filter-child-and-youth-support-ngos').checked;
        var showSocialWelfare = document.getElementById('filter-social-welfare').checked;
    
        // Filter features based on checkbox states
        var filteredFeatures = serviceData.features.filter(function(feature) {
            if (!feature.properties.Type_of_service) return false;
            
            var serviceType = feature.properties.Type_of_service.toLowerCase();
            
            switch(serviceType) {
                case 'health services': return showHealth;
                case 'education services': return showEducation;
                case 'legal & human rights': return showLegal;
                case 'law enforcement & protection': return showLawEnforcement;
                case 'government & municipal administration': return showGovernmentAndMunicipal;
                case 'child & youth support ngos': return showChildAndYouth;
                case 'social welfare & community development': return showSocialWelfare;
                default: return false;
            }
        });
    
        // Add filtered markers to the cluster group
        filteredFeatures.forEach(function(feature) {
            var providerType = feature.properties.Type_of_service 
                ? feature.properties.Type_of_service.toLowerCase() 
                : 'default';
            // console.log("Original Type:", feature.properties.Type_of_service, "Lowercase:", providerType);
            var iconConfig = config.icons[providerType] || config.icons.default;
            // console.log("Resolved icon config:", iconConfig); 
            var marker = L.marker(
                [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 
                {
                    icon: L.AwesomeMarkers.icon({
                        icon: iconConfig.icon,
                        markerColor: iconConfig.colour,
                        prefix: 'fa',
                        iconSize: [35, 40]
                    })
                }


            );
    
            // Create and bind popup content
            var lang = config.localizedStrings[currentLanguage];
            var popupContent = createPopupContent(feature, lang);
            marker.bindPopup(popupContent);
    
            // Add click handler for directions
            marker.on('popupopen', function(e) {
                var popupElement = e.popup.getElement();
                var directionButton = popupElement.querySelector('.get-directions');
                
                if (directionButton) {
                    directionButton.addEventListener('click', function() {
                        var lat = parseFloat(this.getAttribute('data-lat'));
                        var lng = parseFloat(this.getAttribute('data-lng'));
                        showDirections(lat, lng);
                    });
                }
            });
    
            markers.addLayer(marker);
        });
    
        // Add the clustered markers to the map
        map.addLayer(markers);
    }

    function createFallBackImage(errorText) {
        return  `
        <div class="fallback-image">
            <span>${errorText}</span>
        </div>
        `;
    }

    // Clear the current route
    function clearRoute() {
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
        
        if (currentPositionMarker) {
            map.removeLayer(currentPositionMarker);
            currentPositionMarker = null;
        }
        
        document.getElementById('directions-control').style.display = 'none';
        document.getElementById('route-instructions').innerHTML = '';
    }

    // Handle search input
    function handleSearchInput(searchTerm) {
        var resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
        
        if (searchTerm.length < 2) return;
        
        var lang = config.localizedStrings[currentLanguage];
        var term = searchTerm.toLowerCase();
        
        var matches = serviceData.features.filter(function(feature) {
            // var searchText = `${feature.properties.SP_Name} ${feature.properties.name_ewe || ''} ${feature.properties.Physical_Address} ${feature.properties.address_ewe || ''} ${feature.properties.Services} ${feature.properties.services_ewe || ''}`.toLowerCase();
            var searchText = `${feature.properties.SP_Name || ''} ${feature.properties.Physical_Address || ''} ${feature.properties.Services || ''}`.toLocaleLowerCase();
            return searchText.includes(term);
        });
        
        if (matches.length > 0) {
            matches.slice(0, 5).forEach(function(feature) {
                var resultItem = document.createElement('div');
                resultItem.className = 'search-result';
                // resultItem.textContent = currentLanguage === 'ee' && feature.properties.name_ewe 
                //     ? feature.properties.name_ewe 
                //     : feature.properties.SP_Name;
                resultItem.textContent = feature.properties.SP_Name || 'Unknown Service Provider';

                resultItem.addEventListener('click', function() {
                    zoomToProvider(feature);
                    resultsContainer.innerHTML = '';

                    // Set the search input to the selected provider's name
                    // document.getElementById('search-input').value = currentLanguage === 'ee' && feature.properties.name_ewe 
                    //     ? feature.properties.name_ewe 
                    //     : feature.properties.SP_Name;
                    document.getElementById('search-input').value = feature.properties.SP_Name || 'Unknown Service Provider';
                });
                resultsContainer.appendChild(resultItem);
            });
        } else {
            var noResults = document.createElement('div');
            noResults.className = 'search-result';
            noResults.textContent = lang.noResults;
            resultsContainer.appendChild(noResults);
        }
    }

    // Event listener for search input
    document.getElementById('search-input').addEventListener('input', function() {
        handleSearchInput(this.value);
    });

    // Zoom to a provider's location
    function zoomToProvider(feature) {
        var latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        map.setView(latlng, 15);
        
        // Open popup
        markers.getLayers().forEach(function(layer) {
            if (layer instanceof L.Marker) {
                if (layer.getLatLng().equals(latlng)) {
                    layer.openPopup();
                }
            }
        });
    }

    // This function generates the HTML content for the service legend displayed on the map
    function createServiceLegend() {
        const legendContainer = document.getElementById('service-legend');
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        
        let legendHTML = `
            <h4>Service Provider Types</h4>
            <div class="legend-items">
        `;
        
        Object.entries(config.legendIcons).forEach(([category, {icon, colour}]) => {
            legendHTML += `
                <div class="service-legend-item">
                    <i class="fa ${icon} service-legend-icon" style="color:${colour}"></i>
                    <span class="service-legend-label">${category}</span>
                </div>
            `;
        });
        
        legendHTML += `
            </div>
            <div class="legend-date">Data as of ${formattedDate}</div>
        `;
        
        legendContainer.innerHTML = legendHTML;
    }

    // Show directions to a location
    function showDirections(lat, lng) {
        // First, completely remove any existing routing control
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
        
        // Remove any existing instructions container that Leaflet might have created
        document.querySelector('.leaflet-routing-container')?.remove();
        
        // Show your custom directions control
        document.getElementById('directions-control').style.display = 'block';
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var userLat = position.coords.latitude;
                var userLng = position.coords.longitude;
                
                // Clear existing route if any
                if (routingControl) {
                    map.removeControl(routingControl);
                }
                
                // Remove existing position marker if any
                if (currentPositionMarker) {
                    map.removeLayer(currentPositionMarker);
                }
                
                // Add marker for current position
                currentPositionMarker = L.marker([userLat, userLng], {
                    icon: L.AwesomeMarkers.icon({
                        icon: 'fa-user',
                        markerColor: 'purple',
                        prefix: 'fa'
                    })
                }).addTo(map);
                
                // Create route with default instructions hidden
                routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(userLat, userLng),
                        L.latLng(lat, lng)
                    ],
                    routeWhileDragging: true,
                    show: false, // This completely hides the default instructions panel
                    createMarker: function() { return null; },
                    // Add this to prevent Leaflet from creating its container
                    containerClassName: 'no-routing-container' 
                }).addTo(map);

                // Custom instructions
                routingControl.on('routesfound', function(e) {
                    var routes = e.routes;
                    var instructions = document.getElementById('route-instructions');
                    instructions.innerHTML = '';
                    
                    routes[0].instructions.forEach(function(instruction) {
                        var step = document.createElement('div');
                        step.className = 'route-step';
                        step.innerHTML = instruction.text;
                        instructions.appendChild(step);
                        });
                 });
                
            }, function(error) {
                alert(config.localizedStrings[currentLanguage].noLocation + " Error: " + error.message);
            });
        } else {
            alert(config.localizedStrings[currentLanguage].noLocationSupport);
        }
    }

    // Make createFallBackImage available globally
    window.createFallBackImage = createFallBackImage;
    
});
