#!/bin/bash
# Cleanup script - removes analysis/temporary files

echo "🗑️  Cleaning up analysis and temporary files..."
echo ""

# Files to delete (analysis reports and scripts)
FILES_TO_DELETE=(
  "analyze-normalization.js"
  "NORMALIZATION_ANALYSIS_REPORT.md"
  "DETAILED_DATA_LOSS_REPORT.md"
  "QUICK_REFERENCE_SUMMARY.md"
)

# Count files
count=0
for file in "${FILES_TO_DELETE[@]}"; do
  if [ -f "$file" ]; then
    count=$((count + 1))
  fi
done

if [ $count -eq 0 ]; then
  echo "✅ No analysis files found to delete"
else
  echo "Files to delete:"
  for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
      echo "  - $file"
    fi
  done
  echo ""
  read -p "Delete these files? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    for file in "${FILES_TO_DELETE[@]}"; do
      if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Deleted $file"
      fi
    done
    echo ""
    echo "✅ Cleanup complete!"
  else
    echo "❌ Cancelled"
  fi
fi

echo ""
echo "📋 Optional: Individual normalized files"
echo "   If using merged file, these can be deleted:"
echo "   - normalized/manchester_city_parking_bays_normalized.geojson"
echo "   - normalized/camden_cpz_normalized.geojson"
echo "   - normalized/rkbc_parking_bay_normalized.geojson"
echo "   - normalized/warwickshire_parking_normalized.geojson"
echo "   - normalized/Edinburgh_Parking_Bays_normalized.geojson"
echo ""
echo "   (Not deleting automatically - delete manually if needed)"

