# CPZ GeoJSON Normalization

A normalization tool for UK Controlled Parking Zone (CPZ) and parking bay GeoJSON data from multiple councils. This project standardizes diverse council data formats into a unified schema suitable for driver alerting systems.

## 📋 Overview

This project normalizes parking zone and parking bay GeoJSON data from 5 UK councils:
- **Manchester** (19 features)
- **Camden** (53 features)
- **RKBC** (Royal Borough of Kensington and Chelsea) (1,734 features)
- **Warwickshire** (18,979 features)
- **Edinburgh** (7,062 features)

**Total:** 28,847 features normalized

## 🗂️ Project Structure

```
CPZ-GeoJSON/
├── README.md                          # This file
├── normalize-geojson/
│   └── normalize-geojson.js          # Main normalization script
├── merge-normalized.js                # Script to merge all normalized files
├── normalized/                         # Output directory
│   ├── all_councils_merged.geojson   # Single merged file (RECOMMENDED)
│   └── [council]_normalized.geojson  # Individual normalized files
├── [council].geojson                  # Source GeoJSON files (5 files)
├── NORMALIZATION_COMPLETE.md          # Detailed normalization results
└── DELIVERY_OPTIONS.md                # Delivery guide for backend developers
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Normalize a Single File

```bash
node normalize-geojson/normalize-geojson.js <file.geojson> --council <CouncilName>
```

**Examples:**
```bash
node normalize-geojson/normalize-geojson.js manchester_city_parking_bays.geojson --council Manchester
node normalize-geojson/normalize-geojson.js camden_cpz.geojson --council Camden
node normalize-geojson/normalize-geojson.js rkbc_parking_bay.geojson --council RKBC
node normalize-geojson/normalize-geojson.js warwickshire_parking.geojson --council Warwickshire
node normalize-geojson/normalize-geojson.js Edinburgh_Parking_Bays.geojson --council Edinburgh
```

### Merge All Normalized Files

```bash
node merge-normalized.js
```

This creates `normalized/all_councils_merged.geojson` with all 28,847 features.

## 📊 Output Format

### Common Schema (All Councils)

All normalized features include these core fields:

```json
{
  "type": "Feature",
  "properties": {
    "name": "Zone name or street name",
    "type": "Type of restriction/bay",
    "address": "Street address",
    "hours": "Operating hours",
    "restriction": "Restriction details",
    "tariff": "Pricing information",
    "bays": 0,
    "council": "Manchester|Camden|RKBC|Warwickshire|Edinburgh",
    "source": "source_filename.geojson"
  },
  "geometry": { ... }
}
```

### Council-Specific Fields

**Camden:**
- `zone_code` - Zone code (e.g., "CAB")
- `zone_name` - Zone name (e.g., "CA-B Belsize")
- `hours_monday_friday` - Mon-Fri hours
- `hours_saturday` - Saturday hours
- `hours_sunday` - Sunday hours

**Warwickshire:**
- `street_name` - Street name
- `restriction_group` - Restriction category
- `side_of_road` - Which side of road
- `locality` - Area name
- `district` - District name
- `date_from` - When restriction starts
- `date_to` - When restriction ends

**Edinburgh:**
- `zone_number` - Zone number (e.g., "5")
- `bay_type` - Bay type

**RKBC:**
- `street_name` - Street name
- `mode_of_payment` - Payment method
- `date_effective_from` - Effective date
- `car_club_operator` - Car club operator

**Manchester:**
- `location` - GPS coordinates
- `contact` - Contact information
- `run_by` - Run by organization

## 🔧 Adding New Councils

### Automatic Normalization

If the new council uses standard field names (`Name`, `Type`, `Address`, `Hours_of_Operation`, etc.), the script will automatically handle it:

```bash
node normalize-geojson/normalize-geojson.js new_council.geojson --council NewCouncil
```

### Custom Mapping

If the council has a unique schema (like Camden, Warwickshire, or Edinburgh), add council-specific logic to `normalize-geojson/normalize-geojson.js`:

```javascript
if (council === "NewCouncil") {
  return {
    name: p.custom_field_name || "Unknown",
    type: p.custom_type_field || "",
    // ... map other fields
    council,
    source: path.basename(inputFile),
    geometry: f.geometry
  };
}
```

## 📦 Deliverables

### For Backend Developers

**Recommended:** Single merged file
- `normalized/all_councils_merged.geojson` (83.89 MB, 28,847 features)

**Alternative:** Individual files
- 5 separate normalized files in `normalized/` directory

See `DELIVERY_OPTIONS.md` for detailed delivery guide.

## ✅ Data Quality

- **Features Normalized:** 28,847 / 28,847 (100%)
- **Geometry Preserved:** 100%
- **Data Loss:** 0% (all critical fields preserved)
- **GeoJSON Compliance:** 100% (proper structure)

## 🗺️ Viewing the Data

You can view the normalized GeoJSON files using:
- [geojson.io](https://geojson.io/) - Online GeoJSON viewer
- QGIS - Desktop GIS application
- Any GeoJSON-compatible mapping tool

**Note:** When viewing the merged file, zoom out to see all locations:
- Manchester: North West England
- Camden & RKBC: London
- Warwickshire: Midlands
- Edinburgh: Scotland

## 📝 Documentation

- `NORMALIZATION_COMPLETE.md` - Detailed normalization results and schema
- `DELIVERY_OPTIONS.md` - Guide for backend developers

## 🔍 Verification

To verify normalization results:

```bash
# Check feature counts
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('normalized/all_councils_merged.geojson')); console.log('Features:', d.features.length);"

# Check by council
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('normalized/all_councils_merged.geojson')); const councils={}; d.features.forEach(f=>{const c=f.properties.council; councils[c]=(councils[c]||0)+1}); console.log(councils);"
```

## 🛠️ Scripts

### `normalize-geojson/normalize-geojson.js`
Main normalization script with council-specific mappings.

**Usage:**
```bash
node normalize-geojson/normalize-geojson.js <input.geojson> --council <CouncilName>
```

**Output:** Saves to `normalized/[input]_normalized.geojson`

### `merge-normalized.js`
Merges all normalized files into one centralized file.

**Usage:**
```bash
node merge-normalized.js
```

**Output:** Creates `normalized/all_councils_merged.geojson`

## 📊 Statistics

| Council | Features | Status |
|---------|----------|--------|
| Manchester | 19 | ✅ Normalized |
| Camden | 53 | ✅ Normalized |
| RKBC | 1,734 | ✅ Normalized |
| Warwickshire | 18,979 | ✅ Normalized |
| Edinburgh | 7,062 | ✅ Normalized |
| **Total** | **28,847** | ✅ **100%** |

## 🎯 Use Cases

- **Driver Alerting Systems** - Alert drivers when entering controlled zones
- **Parking Apps** - Show available parking zones and restrictions
- **Traffic Management** - Analyze parking restrictions across councils
- **Data Analysis** - Unified dataset for research and analysis

## 📄 License

This project normalizes publicly available council data. Check individual council data licenses for usage terms.

## 🤝 Contributing

To add support for a new council:
1. Add the source GeoJSON file
2. Test with default normalization
3. If needed, add council-specific mapping logic
4. Update this README with council details

## 📞 Support

For questions or issues:
1. Check `NORMALIZATION_COMPLETE.md` for detailed schema information
2. Review `DELIVERY_OPTIONS.md` for backend integration guidance
3. Verify data using the verification commands above

---

**Last Updated:** 2025
**Version:** 1.0
**Status:** ✅ Production Ready

