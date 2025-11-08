# Delivery Options for Backend Developer

## ✅ **RECOMMENDED: Single Merged File**

### Option 1: One Centralized File (RECOMMENDED)

**File:** `normalized/all_councils_merged.geojson`
- **Size:** 83.89 MB
- **Features:** 28,847 (all councils)
- **Structure:** Single GeoJSON FeatureCollection

**Pros:**
- ✅ Single file to import/load
- ✅ One database table/collection
- ✅ Simpler queries (filter by `council` field)
- ✅ Easier to maintain
- ✅ All data in one place

**Cons:**
- ⚠️ Large file size (83 MB)
- ⚠️ Slower initial load (but can be optimized)

**Best for:**
- Single database table/collection
- Backend that loads all data at once
- Simpler architecture

---

### Option 2: Individual Files (Alternative)

**Files:** 5 separate normalized files
- `manchester_city_parking_bays_normalized.geojson` (19 features)
- `camden_cpz_normalized.geojson` (53 features)
- `rkbc_parking_bay_normalized.geojson` (1,734 features)
- `warwickshire_parking_normalized.geojson` (18,979 features)
- `Edinburgh_Parking_Bays_normalized.geojson` (7,062 features)

**Pros:**
- ✅ Smaller individual files
- ✅ Can load councils separately
- ✅ Easier to update individual councils
- ✅ Can parallelize loading

**Cons:**
- ❌ Multiple files to manage
- ❌ Multiple database tables/collections
- ❌ More complex queries (need to join/union)
- ❌ More complex code

**Best for:**
- Microservices architecture
- Council-specific databases
- Need to update councils independently

---

## 📋 **Recommendation: Use Merged File**

**Give your backend developer:**
1. ✅ `normalized/all_councils_merged.geojson` (single file)
2. ✅ Schema documentation (see below)

**Why:**
- Simpler for backend to import
- Single table/collection
- Filter by `council` field when needed
- Easier to query across all councils

---

## 📊 **Merged File Structure**

All features have this common structure:

```json
{
  "type": "Feature",
  "properties": {
    // Common fields (all councils)
    "name": "...",
    "type": "...",
    "address": "...",
    "hours": "...",
    "restriction": "...",
    "tariff": "...",
    "bays": 0,
    "council": "Manchester|Camden|RKBC|Warwickshire|Edinburgh",
    "source": "filename.geojson",
    
    // Council-specific fields (may be empty for other councils)
    "zone_code": "...",           // Camden only
    "zone_name": "...",            // Camden only
    "hours_monday_friday": "...",  // Camden only
    "hours_saturday": "...",       // Camden only
    "hours_sunday": "...",         // Camden only
    "street_name": "...",          // Warwickshire, RKBC
    "restriction_group": "...",    // Warwickshire only
    "side_of_road": "...",         // Warwickshire only
    "date_from": "...",            // Warwickshire, RKBC
    "date_to": "...",              // Warwickshire only
    "zone_number": "...",          // Edinburgh only
    "bay_type": "...",             // Edinburgh only
    "mode_of_payment": "...",      // RKBC only
    // ... etc
  },
  "geometry": { ... }
}
```

---

## 🔍 **Query Examples**

With merged file, backend can:

```javascript
// Get all features
const allFeatures = mergedData.features;

// Filter by council
const manchesterFeatures = mergedData.features.filter(f => f.properties.council === "Manchester");

// Filter by zone code (Camden)
const camdenZoneCAB = mergedData.features.filter(f => 
  f.properties.council === "Camden" && f.properties.zone_code === "CAB"
);

// Filter by restriction type (Warwickshire)
const noWaiting = mergedData.features.filter(f => 
  f.properties.council === "Warwickshire" && 
  f.properties.restriction === "No Waiting At Any Time"
);

// Get all zones with hours
const zonesWithHours = mergedData.features.filter(f => f.properties.hours);
```

---

## 📦 **What to Deliver**

**To Backend Developer:**
1. ✅ `normalized/all_councils_merged.geojson` (83.89 MB)
2. ✅ This documentation file
3. ✅ `NORMALIZATION_COMPLETE.md` (schema details)

**Optional:**
- Individual normalized files (if they want separate tables)
- `merge-normalized.js` script (if they want to regenerate)

---

## ⚡ **Performance Notes**

**File Size:** 83.89 MB
- Can be compressed (gzip) to ~10-15 MB
- Backend can load incrementally
- Can split into chunks if needed
- Database import should handle this size fine

**Optimization Tips:**
- Use database indexing on `council` field
- Consider spatial indexing on `geometry`
- Load in batches if memory is concern
- Use streaming parser for large files

---

## ✅ **Summary**

**Give them:** `normalized/all_councils_merged.geojson` (single file)

**Why:** Simpler, cleaner, easier to work with

**They can:** Filter by `council` field to get council-specific data

