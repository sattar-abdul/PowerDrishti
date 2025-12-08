import XLSX from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { PDFExtract } from 'pdf.js-extract';

const pdfExtract = new PDFExtract();

// Map CSV/XLSX headers to database fields
const FIELD_MAPPING = {
    'project name': 'project_name',
    'project start date': 'project_start_date',
    'expected completion period': 'expected_completion_period',
    'state': 'state_region',
    'state region': 'state_region',
    'district': 'district',
    'terrain type': 'terrain_type',
    'project type': 'project_type',
    'line voltage level': 'line_voltage_level',
    'substation type': 'substation_type',
    'expected towers': 'expected_towers',
    'route length (km)': 'route_km',
    'route km': 'route_km',
    'average span (m)': 'avg_span_m',
    'avg span m': 'avg_span_m',
    'number of circuits': 'num_circuits',
    'num circuits': 'num_circuits',
    'number of bays': 'no_of_bays',
    'no of bays': 'no_of_bays',
    'total budget (crores)': 'total_budget',
    'total budget': 'total_budget',
    'taxes/duty (%)': 'taxes_duty',
    'taxes duty': 'taxes_duty',
    'tower types': 'tower_types'
};

export const parsePDF = async (buffer) => {
    try {
        const data = await pdfExtract.extractBuffer(buffer, {});
        const projectData = {};

        // Combine all pages
        data.pages.forEach(page => {
            // Sort content by y (lines) then x (position in line) to ensure correct reading order
            const content = page.content.sort((a, b) => {
                if (Math.abs(a.y - b.y) < 5) return a.x - b.x; // Same line (within 5px tolerance)
                return a.y - b.y;
            });

            // Group into lines based on Y position
            let currentLineY = -1;
            let currentLineText = "";
            const lines = [];

            content.forEach(item => {
                if (currentLineY === -1 || Math.abs(item.y - currentLineY) < 5) {
                    currentLineText += (currentLineText ? " " : "") + item.str;
                    currentLineY = item.y;
                } else {
                    lines.push(currentLineText);
                    currentLineText = item.str;
                    currentLineY = item.y;
                }
            });
            if (currentLineText) lines.push(currentLineText);

            // Parse each line
            // Parse each line
            lines.forEach((line, index) => {
                const normalizedLine = line.trim();
                if (!normalizedLine) return; // Skip empty lines

                console.log(`Processing Line ${index}: "${normalizedLine}"`);

                for (const [key, fieldName] of Object.entries(FIELD_MAPPING)) {
                    // Create a more flexible regex
                    // 1. Allow optional leading characters like bullets, numbers, dashes, spaces (e.g. "1. Project Name", "- Project Name")
                    // 2. Match the key case-insensitive
                    // 3. Match separators: colon, equal, dash, or just multiple spaces
                    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                    // Regex explanation:
                    // ^[^a-zA-Z0-9]* -> Match start of string followed by non-alphanumeric chars (bullets, numbers, dots etc)
                    // ${escapedKey} -> The key we are looking for (e.g. "Project Name")
                    // \s*[:=-]?\s* -> Optional separator (: or = or -) surrounded by spaces
                    const regex = new RegExp(`^[^a-zA-Z0-9]*${escapedKey}\\s*[:=-]?\\s*`, 'i');

                    if (regex.test(normalizedLine)) {
                        // Extract value by replacing the matched key part
                        const valueParts = normalizedLine.split(regex);
                        // valueParts[0] is garbage/preamble, valueParts[1] (or last item) is the actual value
                        const value = valueParts[valueParts.length - 1].trim();

                        console.log(`  -> Match Found: Key="${key}" -> Value="${value}"`);

                        if (value) {
                            mapRowToField(key, value, projectData);
                        }
                        break;
                    }
                }
            });
        });

        return {
            // Reconstruct full text for reference
            text: data.pages.map(p => p.content.map(c => c.str).join(' ')).join('\n'),
            data: projectData
        };
    } catch (error) {
        throw new Error(`PDF parsing failed: ${error.message}`);
    }
};

const mapRowToField = (key, value, projectData) => {
    if (!key) return;

    // Normalize key
    const normalizedKey = key.toLowerCase().trim().replace(/:/g, '');
    const mappedField = FIELD_MAPPING[normalizedKey];

    if (mappedField) {
        let cleanValue = value ? value.trim() : '';

        // Special handling for specific fields
        if (mappedField === 'tower_types') {
            // Split by semicolon or comma if multiple types
            projectData[mappedField] = cleanValue.split(/[;,]/).map(t => t.trim()).filter(Boolean);
        } else if (['expected_towers', 'route_km', 'avg_span_m', 'num_circuits', 'no_of_bays', 'total_budget', 'taxes_duty', 'expected_completion_period'].includes(mappedField)) {
            // Remove non-numeric chars except dot
            projectData[mappedField] = cleanValue.replace(/[^0-9.]/g, '');
        } else if (mappedField === 'project_start_date') {
            // Attempt to normalize date to YYYY-MM-DD for HTML input
            const date = new Date(cleanValue);
            if (!isNaN(date.getTime())) {
                projectData[mappedField] = date.toISOString().split('T')[0];
            } else {
                // Try parsing DD-MM-YYYY or DD/MM/YYYY manually if Date() fails or assumes MM-DD-YYYY
                const parts = cleanValue.split(/[-/]/);
                if (parts.length === 3) {
                    // Assume DD-MM-YYYY if first part > 12 or generally reasonable guess
                    // But simpler is to check if we can reconstruct it.
                    // Let's assume input might be DD/MM/YYYY or YYYY-MM-DD
                    if (parts[0].length === 4) {
                        // YYYY-MM-DD - just ensure it's dash separated
                        projectData[mappedField] = `${parts[0]}-${parts[1]}-${parts[2]}`;
                    } else {
                        // DD-MM-YYYY -> YYYY-MM-DD
                        projectData[mappedField] = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                } else {
                    projectData[mappedField] = cleanValue; // Fallback
                }
            }
        } else {
            projectData[mappedField] = cleanValue;
        }
    }
};

export const parseCSV = async (buffer) => {
    return new Promise((resolve, reject) => {
        const projectData = {};
        const stream = Readable.from(buffer.toString());

        stream.pipe(csv({ headers: false }))
            .on('data', (row) => {
                // Expecting Key, Value format (Column 0, Column 1)
                const key = row[0];
                const value = row[1];
                mapRowToField(key, value, projectData);
            })
            .on('end', () => {
                resolve(projectData);
            })
            .on('error', (error) => reject(new Error(`CSV parsing failed: ${error.message}`)));
    });
};

export const parseXLSX = async (buffer) => {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const projectData = {};

        jsonData.forEach(row => {
            if (row.length >= 2) {
                const key = row[0];
                const value = row[1];
                mapRowToField(key, value, projectData);
            }
        });

        return projectData;
    } catch (error) {
        throw new Error(`XLSX parsing failed: ${error.message}`);
    }
};

export const parseProjectFile = async (file) => {
    try {
        let extractedData = {};
        const mimeType = file.mimetype;

        if (mimeType === 'text/csv') {
            extractedData = await parseCSV(file.buffer);
            var extractedText = 'Parsed via Direct Method (CSV)';
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'application/vnd.ms-excel') {
            extractedData = await parseXLSX(file.buffer);
            var extractedText = 'Parsed via Direct Method (XLSX)';
        } else if (mimeType === 'application/pdf') {
            const pdfResult = await parsePDF(file.buffer);
            extractedData = pdfResult.data;
            var extractedText = pdfResult.text.substring(0, 500);
        } else {
            throw new Error('Unsupported file format. Please upload PDF, CSV, or XLSX files.');
        }

        // Fill in defaults for missing fields
        const finalData = {
            project_name: extractedData.project_name || '',
            project_start_date: extractedData.project_start_date || '',
            expected_completion_period: extractedData.expected_completion_period || '',
            state_region: extractedData.state_region || '',
            district: extractedData.district || '',
            terrain_type: extractedData.terrain_type || '',
            project_type: extractedData.project_type || '',
            line_voltage_level: extractedData.line_voltage_level || '',
            substation_type: extractedData.substation_type || 'None',
            expected_towers: extractedData.expected_towers || '',
            tower_types: Array.isArray(extractedData.tower_types) ? extractedData.tower_types : [],
            route_km: extractedData.route_km || '',
            avg_span_m: extractedData.avg_span_m || '300',
            num_circuits: extractedData.num_circuits || '1',
            no_of_bays: extractedData.no_of_bays || '0',
            total_budget: extractedData.total_budget || '',
            taxes_duty: extractedData.taxes_duty || ''
        };

        return {
            success: true,
            data: finalData,
            extractedText: 'Parsed via Direct Method'
        };
    } catch (error) {
        console.error('File parsing error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
