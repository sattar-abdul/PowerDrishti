// Material Tooltips Configuration
// Provides helpful context for high-priority materials based on construction phase

export const MATERIAL_TOOLTIPS = {
    // PHASE 1 — EARTHING & FOUNDATION (Highest Priority)
    "Earth_Rods_units": "Required at the very start for earthing grid installation. Without grounding, no foundation or electrical work can begin.",

    "Earthing_Mat_sets": "Essential for substation grounding. Must be installed before any major civil or electrical activity.",

    "Foundation_Concrete_m3": "Critical for all tower and structure foundations. Delays in concrete lead to full project slowdown.",

    "Cement_MT": "Needed for immediate foundation casting. Cement shortage directly delays civil work progress.",

    "Sand_m3": "Primary material for concrete and foundation works. Required from Day 1 of site activity.",

    "Aggregate_m3": "Used in concrete mix for foundations. Must be available during initial civil construction.",

    // PHASE 1–2 — STRUCTURE FABRICATION & ERECTION
    "Tower_Steel_MT": "Main structural material for tower erection. Steel availability is crucial for progressing on schedule.",

    "Angle_Tower_MT": "Supports tower assembly. Shortage stops tower erection completely.",

    "Bolts_Nuts_pcs": "Required for assembling towers and structures. Missing even small quantities can halt erection work.",

    "Misc_Hardware_lots": "Includes connectors, brackets, and small fittings. Critical during continuous assembly activities.",

    // PHASE 3 — STRINGING (Transmission Line)
    "ACSR_Moose_tons": "Primary conductors for transmission lines. Stringing cannot start without them, delaying energization.",

    "ACSR_Zebra_tons": "Primary conductors for transmission lines. Stringing cannot start without them, delaying energization.",

    "AAAC_tons": "Primary conductors for transmission lines. Stringing cannot start without them, delaying energization.",

    "OPGW_km": "Optical ground wire needed for both grounding and communication. Installed during stringing stage.",

    "Earthwire_km": "Topmost shield wire placed during stringing. Required immediately once tower erection is complete.",

    "Conductor_Accessories_sets": "Crucial for conductor fixing, tensioning, and joints. Missing accessories stop stringing activity.",

    "Vibration_Dampers_pcs": "Installed along conductors to reduce vibration. Required during or right after stringing.",

    "Spacer_Dampers_pcs": "Keeps bundled conductors stable. Mandatory before line testing and commissioning.",

    "Clamp_Fittings_sets": "Used to secure conductors and earthwire to towers. Needed throughout stringing operations.",

    // PHASE 4 — MAJOR ELECTRICAL EQUIPMENT (Long Lead Time)
    "Power_Transformer_units": "Long lead-time equipment. Delivery delays have the highest impact on project commissioning.",

    "Transformer_MVA_units": "Backbone of the substation. Must arrive early due to long manufacturing duration.",

    "Circuit_Breaker_units": "Important for protection and switching. Required before any electrical testing.",

    "Isolator_units": "Used for safe isolation of circuits. Needed early in the electrical installation phase.",

    "CT_PT_sets": "Critical for measurement and protection. Must be installed before relay testing begins.",

    "Relay_Panels_units": "Essential for protection system. Delays can push back commissioning timelines.",

    // PHASE 5 — CABLING & BUS WORK
    "Control_Cable_m": "Required for panel-to-equipment wiring. Cable shortages delay control system integration.",

    "Power_Cable_m": "Key for power distribution inside the substation. Needed for energizing equipment.",

    "Busbar_MT": "Forms the main current path in the substation. Critical for interconnecting bays.",

    "Cable_Trays_m": "Carries control and power cables. Must be installed before cabling works begin.",

    // PHASE 6 — FINISHING & SAFETY WORKS
    "Lighting_Protection_sets": "Provides lightning safety for the substation. Installed at the end but must be planned early."
};

/**
 * Get tooltip text for a material
 * @param {string} materialId - The material identifier
 * @returns {string|null} - Tooltip text or null if not available
 */
export const getTooltipForMaterial = (materialId) => {
    return MATERIAL_TOOLTIPS[materialId] || null;
};

/**
 * Check if a material has a tooltip
 * @param {string} materialId - The material identifier
 * @returns {boolean} - True if tooltip exists
 */
export const hasTooltip = (materialId) => {
    return materialId in MATERIAL_TOOLTIPS;
};
