import L from 'leaflet';

// Dashboard Data
export const dummyProjects = [
    { id: 1, project_name: 'North Region Transmission Line', location: 'North', budget: 500000000, status: 'In Progress' },
    { id: 2, project_name: 'South Grid Upgrade', location: 'South', budget: 750000000, status: 'Planning' },
    { id: 3, project_name: 'West Coast Substation', location: 'West', budget: 300000000, status: 'Completed' },
    { id: 4, project_name: 'Eastern Corridor Project', location: 'East', budget: 900000000, status: 'In Progress' },
    { id: 5, project_name: 'Central India Connectivity', location: 'Central', budget: 450000000, status: 'Planning' },
];

export const dummyMaterials = [
    { id: 1, status: 'In Transit' },
    { id: 2, status: 'Delivered' },
    { id: 3, status: 'In Transit' },
    { id: 4, status: 'Delayed' },
    { id: 5, status: 'In Transit' },
    { id: 6, status: 'Delivered' },
    { id: 7, status: 'In Transit' },
    { id: 8, status: 'In Transit' },
    { id: 9, status: 'Delivered' },
    { id: 10, status: 'Delayed' },
];

export const dummyCarbonData = Array.from({ length: 20 }, (_, i) => ({
    emissions_kg: Math.random() * 500 + 100 // Random emissions between 100 and 600 kg
}));

// Material Tracking Data
export const trackingMaterials = [
    {
        id: 1,
        name: "Steel Tower",
        status: "In Transit",
        location: [20.6, 78.9],
        carbon_emissions: 120,
        project_id: "1",
        material_type: "Steel Tower",
        quantity: 50,
        unit: "tons",
        eta: "2023-12-01",
        current_location: { lat: 20.6, lng: 78.9, address: "Nagpur, Maharashtra" }
    },
    {
        id: 2,
        name: "Transformer",
        status: "Delivered",
        location: [20.7, 78.95],
        carbon_emissions: 0,
        project_id: "2",
        material_type: "Transformer",
        quantity: 2,
        unit: "units",
        eta: "2023-11-20",
        current_location: { lat: 20.7, lng: 78.95, address: "Wardha, Maharashtra" }
    },
    {
        id: 3,
        name: "Cables",
        status: "Delayed",
        location: [20.8, 78.97],
        carbon_emissions: 80,
        project_id: "1",
        material_type: "Cables",
        quantity: 1000,
        unit: "meters",
        eta: "2023-12-05",
        current_location: { lat: 20.8, lng: 78.97, address: "Amravati, Maharashtra" }
    }
];

// Map Icons
export const truckIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5" fill="#3b82f6"></circle>
      <circle cx="18.5" cy="18.5" r="2.5" fill="#3b82f6"></circle>
    </svg>
  `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

export const deliveredIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5" fill="#10b981"></circle>
      <circle cx="18.5" cy="18.5" r="2.5" fill="#10b981"></circle>
      <polyline points="9 11 12 14 22 4" stroke="#10b981"></polyline>
    </svg>
  `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

export const delayedIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5" fill="#ef4444"></circle>
      <circle cx="18.5" cy="18.5" r="2.5" fill="#ef4444"></circle>
      <circle cx="12" cy="8" r="3" stroke="#ef4444"></circle>
      <line x1="12" y1="6" x2="12" y2="8" stroke="#ef4444"></line>
      <line x1="12" y1="9" x2="12" y2="9" stroke="#ef4444"></line>
    </svg>
  `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

export const pendingIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5" fill="#f59e0b"></circle>
      <circle cx="18.5" cy="18.5" r="2.5" fill="#f59e0b"></circle>
    </svg>
  `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});
