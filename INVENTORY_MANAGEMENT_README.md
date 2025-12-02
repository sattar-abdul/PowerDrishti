# Inventory Management System

## Overview
The Inventory Management system allows you to track and manage material inventory for each project in PowerDrishti. It supports 33 predefined POWERGRID-specific inventory items.

## Features

### 1. **Project-Based Inventory**
- Each project has its own inventory
- Automatically initializes with 33 default items
- Items include conductors, towers, insulators, cables, transformers, and construction materials

### 2. **CSV Import/Export**
- **Import**: Upload a CSV file to bulk update inventory quantities
- **Export**: Download current inventory data as CSV for external processing
- CSV Format: `Item Name, Quantity, Unit`

### 3. **Real-Time Editing**
- Edit item names, quantities, and units directly in the table
- Changes are saved to the database with a single click
- Visual feedback for save operations

### 4. **Default Inventory Items**
The system includes 33 predefined items:

1. ACSR_Moose_tons - tons
2. ACSR_Zebra_tons - tons
3. AAAC_tons - tons
4. OPGW_km - km
5. Earthwire_km - km
6. Tower_Steel_MT - MT
7. Angle_Tower_MT - MT
8. Bolts_Nuts_pcs - pcs
9. Disc_Insulators_units - units
10. Longrod_Insulators_units - units
11. Vibration_Dampers_pcs - pcs
12. Spacer_Dampers_pcs - pcs
13. Clamp_Fittings_sets - sets
14. Conductor_Accessories_sets - sets
15. Earth_Rods_units - units
16. Foundation_Concrete_m3 - m3
17. Control_Cable_m - m
18. Power_Cable_m - m
19. Transformer_MVA_units - units
20. Power_Transformer_units - units
21. Circuit_Breaker_units - units
22. Isolator_units - units
23. CT_PT_sets - sets
24. Relay_Panels_units - units
25. Busbar_MT - MT
26. Cement_MT - MT
27. Sand_m3 - m3
28. Aggregate_m3 - m3
29. Earthing_Mat_sets - sets
30. MC501_units - units
31. Cable_Trays_m - m
32. Lighting_Protection_sets - sets
33. Misc_Hardware_lots - lots

## Usage

### Accessing Inventory Management
1. Navigate to **Inventory Management** from the sidebar
2. Select a project from the dropdown
3. The inventory will load automatically with 33 default items

### Importing from CSV
1. Click on the **Upload CSV File** area
2. Select your CSV file (must match the format)
3. Data will be automatically imported and displayed
4. Click **Save Inventory** to persist changes

### Exporting to CSV
1. Select a project
2. Click **Download Current Data**
3. CSV file will be downloaded with current inventory data

### Manual Editing
1. Click on any cell in the table
2. Edit the value
3. Click **Save Inventory** to save all changes

## API Endpoints

### Backend Routes
- `GET /api/inventory/:projectId` - Get inventory for a specific project
- `PUT /api/inventory/:projectId` - Update inventory for a specific project
- `GET /api/inventory` - Get all inventories for the logged-in user

### Request/Response Format
```json
{
  "project": "project_id",
  "user": "user_id",
  "items": [
    {
      "item_name": "ACSR_Moose_tons",
      "quantity": 150,
      "unit": "tons"
    }
  ],
  "last_updated": "2025-12-02T16:49:47.000Z"
}
```

## CSV Template
A sample CSV template is available at `inventory_template.csv` in the project root directory.

## Database Schema
```javascript
{
  project: ObjectId (ref: 'Project'),
  user: ObjectId (ref: 'User'),
  items: [{
    item_name: String,
    quantity: Number,
    unit: String
  }],
  last_updated: Date,
  timestamps: true
}
```

## Notes
- Inventory is automatically created with default items when first accessed
- CSV import matches items by name (case-insensitive) or by position
- All changes require manual save to persist to database
- Last updated timestamp is automatically tracked
