#!/usr/bin/env node
import fs from "fs";
import path from "path";

// Simple argument parsing
const [,, inputFile, ...args] = process.argv;
if (!inputFile) {
  console.error("❌ Usage: node normalize-geojson.js <file.geojson> --council <name>");
  process.exit(1);
}

const councilArg = args.find(a => a.startsWith("--council"));
const council = councilArg ? councilArg.split("=")[1] || args[args.indexOf(councilArg) + 1] : "Unknown";

const filePath = path.resolve(inputFile);
const raw = fs.readFileSync(filePath, "utf8");
const geojson = JSON.parse(raw);

// Utility function to extract text safely
const clean = (v) => (v || "").toString().replace(/<[^>]+>/g, "").trim();

// Extract from description using regex - improved to stop at <br> tags
function extractFromDescription(desc, label) {
  // Try with colon first
  let regex = new RegExp(`${label}\\s*:\\s*([^<\\n]*?)(?:<br|\\n|$)`, "i");
  let match = desc?.match(regex);
  if (match) return clean(match[1]);
  
  // Try with dash
  regex = new RegExp(`${label}\\s*-\\s*([^<\\n]*?)(?:<br|\\n|$)`, "i");
  match = desc?.match(regex);
  if (match) return clean(match[1]);
  
  return "";
}

// Extract bay count from name (e.g., "Brick Street - 3 bays" -> 3)
function extractBayCount(name) {
  if (!name) return 0;
  const match = name.match(/(\d+)\s*bays?/i);
  return match ? parseInt(match[1]) : 0;
}

// Normalize a single feature with council-specific logic
function normalizeFeature(f) {
  const p = f.properties || {};
  const desc = clean(p.description || "");
  
  // Council-specific normalization
  if (council === "Camden" || council === "camden") {
    return {
      name: p.controlled_parking_zone_name || p.sub_zone_name || "Unknown",
      type: "Controlled Parking Zone",
      address: p.sub_zone_name || "",
      hours: p.control_monday_to_friday || "",
      hours_monday_friday: p.control_monday_to_friday || "",
      hours_saturday: p.control_saturday || "",
      hours_sunday: p.control_sunday || "",
      restriction: "",
      tariff: "",
      bays: 0,
      zone_code: p.controlled_parking_zone_code || "",
      zone_name: p.controlled_parking_zone_name || "",
      sub_zone_name: p.sub_zone_name || "",
      identifier: p.identifier || "",
      council,
      source: path.basename(inputFile),
      geometry: f.geometry
    };
  }
  
  if (council === "Warwickshire" || council === "warwickshire") {
    return {
      name: p.street_name || "Unknown",
      type: p.order_type || p.restriction || "",
      address: p.street_name || "",
      hours: "",
      restriction: p.restriction || "",
      restriction_group: p.restriction_group || "",
      tariff: "",
      bays: 0,
      street_name: p.street_name || "",
      side_of_road: p.side_of_road || "",
      locality: p.locality || "",
      district: p.district || "",
      location: p.location || "",
      order_type: p.order_type || "",
      order_reference: p.order_reference || "",
      date_from: p.date_from || "",
      date_to: p.date_to || "",
      schedule: p.schedule || "",
      council,
      source: path.basename(inputFile),
      geometry: f.geometry
    };
  }
  
  if (council === "Edinburgh" || council === "edinburgh") {
    return {
      name: p.Zone_No ? `Zone ${p.Zone_No}` : "Unknown",
      type: p.Bay_Type || "",
      address: "",
      hours: "",
      restriction: "",
      tariff: "",
      bays: 0,
      zone_number: p.Zone_No || "",
      bay_type: p.Bay_Type || "",
      council,
      source: path.basename(inputFile),
      geometry: f.geometry
    };
  }
  
  if (council === "Manchester" || council === "manchester") {
    // Extract bay count from name
    const name = p.Name || extractFromDescription(desc, "Name") || "Unknown";
    const bays = extractBayCount(name) || 0;
    
    // Fix hours extraction - stop at <br> tag
    let hours = p.Opening_hours || "";
    if (!hours && desc) {
      const hoursMatch = desc.match(/Opening hours:\s*([^<]*?)(?:<br|$)/i);
      if (hoursMatch) {
        hours = clean(hoursMatch[1]);
      }
    }
    
    return {
      name: name,
      type: p.Type || extractFromDescription(desc, "Type") || "",
      address: p.Address || extractFromDescription(desc, "Address") || "",
      hours: hours,
      restriction: "",
      tariff: "",
      bays: bays,
      location: p.Location || "",
      contact: p.Contact || "",
      run_by: p.Run_by || "",
      council,
      source: path.basename(inputFile),
      geometry: f.geometry
    };
  }
  
  if (council === "RKBC" || council === "rkbc" || council === "Royal Borough of Kensington and Chelsea") {
    // Map Street_Name to address
    const streetName = p.Street_Name || "";
    const address = streetName || p.Address || extractFromDescription(desc, "Address") || "";
    
    // Extract name from Street_Name if available, otherwise use Name
    let name = streetName || p.Name || extractFromDescription(desc, "Name") || "Unknown";
    // If name is generic "Parking Bay on:", use street name or extract from description
    if (name === "Parking Bay on:" || name === "Parking Bay on") {
      if (streetName) {
        name = streetName;
      } else {
        // Try to extract street name from description
        const streetMatch = desc.match(/<p>([^<]+)<br>/i);
        if (streetMatch) {
          name = clean(streetMatch[1]);
        }
      }
    }
    
    return {
      name: name,
      type: p.Type_of_Bay || p.Type || extractFromDescription(desc, "Type") || "",
      address: address,
      hours: p.Hours_of_Operation || extractFromDescription(desc, "Opening hours") || extractFromDescription(desc, "Hours") || "",
      restriction: p.Restriction || extractFromDescription(desc, "Restriction") || "",
      tariff: p.Tariff || extractFromDescription(desc, "Tariff") || "",
      bays: Number(p.No_of_Bays || extractFromDescription(desc, "No_of_Bays") || 0),
      street_name: streetName,
      mode_of_payment: p.Mode_of_Payment || "",
      date_effective_from: p.Date_Effective_From || "",
      car_club_operator: p.Car_Club_Operator || "",
      ref: p.Ref || "",
      council,
      source: path.basename(inputFile),
      geometry: f.geometry
    };
  }
  
  // Default normalization for other councils
  const name = p.Name || extractFromDescription(desc, "Name") || "Unknown";
  const bays = extractBayCount(name) || Number(p.No_of_Bays || extractFromDescription(desc, "No_of_Bays") || 0);
  
  // Fix hours extraction - stop at <br> tag
  let hours = p["Hours_of_Operation"] || "";
  if (!hours && desc) {
    const hoursMatch = desc.match(/Opening hours:\s*([^<]*?)(?:<br|$)/i);
    if (hoursMatch) {
      hours = clean(hoursMatch[1]);
    } else {
      hours = extractFromDescription(desc, "Hours") || "";
    }
  }
  
  return {
    name: name,
    type: p.Type || p["Type_of_Bay"] || extractFromDescription(desc, "Type") || "",
    address: p.Address || p.Street_Name || extractFromDescription(desc, "Address") || "",
    hours: hours,
    restriction: p.Restriction || extractFromDescription(desc, "Restriction") || "",
    tariff: p.Tariff || extractFromDescription(desc, "Tariff") || "",
    bays: bays,
    council,
    source: path.basename(inputFile),
    geometry: f.geometry
  };
}

// Normalize all features - wrap properties in proper GeoJSON structure
const normalized = {
  type: "FeatureCollection",
  features: geojson.features.map(f => {
    const normalizedProps = normalizeFeature(f);
    const { geometry, ...properties } = normalizedProps;
    return {
      type: "Feature",
      properties: properties,
      geometry: geometry
    };
  })
};

// Output folder
const outDir = path.resolve("normalized");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Save normalized file
const outPath = path.join(outDir, path.basename(inputFile, ".geojson") + "_normalized.geojson");
fs.writeFileSync(outPath, JSON.stringify(normalized, null, 2));

console.log(`✅ Normalized ${geojson.features.length} features from ${path.basename(inputFile)}`);
console.log(`📁 Saved to: ${outPath}`);
console.log(`🏛️  Council: ${council}`);
