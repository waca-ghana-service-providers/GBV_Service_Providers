// Configurations and translations 
var config = {
    // Map initial view 
    mapCenter: [5.922045, 0.999705], // Volta Region, Ghana
    initialZoom: 12,

    // Loaded strings  
    localizedStrings: {
        "en": {
            "searchPlaceholder": "Search service providers...",
            "noResults": "No matches found",
            "noLocation": "Could not get your location",
            "noLocationSupport": "Geolocation is not supported by your browser",
            "filterTitle": "Filter Services",
            "medical": "Medical",
            "shelter": "Shelter",
            "legal": "Legal",
            'counseling': "Counseling",
            "other": "Other",
            "directions": "Directions",
            "clearRoute": "Clear Route",
            "switchLanguage": "Switch to Ewe",
            "address": "Address",
            "contact": "Contact",
            "email": "Email",
            "services": "Services",
            "hours": "Hours",
            "getDirections": "Get Directions",
            "loading": "Loading data...",
            "imageError": "Image not available"
        }
    },

    // Map Icon definitions 
    icons: {
        "health services": {
            icon: 'fa-solid fa-h',
            colour: 'red'
        },
        "education services": {
            icon: 'fa-school',
            colour: 'blue'
        },
        "legal & human rights": {
            icon: 'fa-gavel',
            colour: 'green'
        },
        "law enforcement & protection": {
            icon: 'fa-shield',
            colour: 'black'
        },
        "child & youth support ngos": {
            icon: 'fa-hands-helping',
            colour: 'orange'
        },
        "government & municipal administration": {
            icon: 'fa-landmark',
            colour: 'purple'
        },
        "social welfare & community development": {
            icon: 'fa-heart',
            colour: 'pink'
        },

        default: {
            icon: 'fa-map-marker-alt',
            colour: 'yellow'
        }
    },

    // Paths 
    // Data crs must be in WGS84:4326
    providerDataPath: './src/data/gbv_service_providers.geojson',
    districtDataPath: './src/data/districts.geojson',
    imagePath: "./src/images/service_providers/",

    // Legend Icon definitions 
    legendIcons: {
        "Health Services": {
            icon: 'fa-solid fa-h',
            colour: '#E15759'
        },
        "Education Services": {
            icon: 'fa-school',
            colour: '#4E79A7'
        },
        "Legal & Human Rights": {
            icon: 'fa-gavel',
            colour: '#59A14F'
        },
        "Law Enforcement & Protection": {
            icon: 'fa-shield',
            colour: '#343a40'
        },
        "Child & Youth Support NGOs": {
            icon: 'fa-hands-helping',
            colour: '#F28E2B'
        },
        "Government & Municipal Administration": {
            icon: 'fa-landmark',
            colour: '#B07AA1'
        },
        "Social Welfare & Community Development": {
            icon: 'fa-heart',
            // colour: '#735751'
            colour:' #FFC0CB'
        }
    },

}