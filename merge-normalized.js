#!/usr/bin/env node
import fs from "fs";
import path from "path";

// Merge all normalized GeoJSON files into one centralized file
const normalizedDir = path.resolve("normalized");
const outputFile = path.resolve("normalized/all_councils_merged.geojson");

// Get all normalized files
const files = fs.readdirSync(normalizedDir)
  .filter(f => f.endsWith("_normalized.geojson"))
  .map(f => path.join(normalizedDir, f));

console.log(`Found ${files.length} normalized files to merge:`);
files.forEach(f => console.log(`  - ${path.basename(f)}`));

// Merge all features
const allFeatures = [];
let totalFeatures = 0;

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const features = data.features || [];
  allFeatures.push(...features);
  totalFeatures += features.length;
  console.log(`  ✓ Added ${features.length} features from ${path.basename(file)}`);
});

// Create merged GeoJSON
const merged = {
  type: "FeatureCollection",
  features: allFeatures
};

// Save merged file
fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2));

console.log(`\n✅ Merged ${totalFeatures} features from ${files.length} councils`);
console.log(`📁 Saved to: ${outputFile}`);
console.log(`📊 File size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);

// Generate summary statistics
const councilStats = {};
allFeatures.forEach(f => {
  const council = f.properties.council || "Unknown";
  councilStats[council] = (councilStats[council] || 0) + 1;
});

console.log(`\n📈 Council breakdown:`);
Object.entries(councilStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([council, count]) => {
    console.log(`  ${council}: ${count.toLocaleString()} features`);
  });

