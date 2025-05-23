#!/bin/bash

# Enable debugging
set -x

# Check if input file is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 input_file.png [output_directory]"
    exit 1
fi

INPUT_FILE="$1"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found."
    exit 1
fi

FILENAME=$(basename -- "$INPUT_FILE")
FILENAME_NOEXT="${FILENAME%.*}"

# Set output directory (default is current directory)
if [ $# -ge 2 ]; then
    OUTPUT_DIR="$2"
    mkdir -p "$OUTPUT_DIR"
else
    OUTPUT_DIR="."
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it first."
    exit 1
fi

# Function to handle errors
handle_error() {
    echo "Error processing image at step: $1"
    echo "Command failed: $2"
    exit 1
}

echo "Processing $INPUT_FILE..."

# Trim first
echo "Trimming excess space (forceful method)..."
convert "$INPUT_FILE" -fuzz 1% -trim +repage "$OUTPUT_DIR/${FILENAME_NOEXT}_trimmed.png" || handle_error "trimming" "convert trim"

# Verify if trimming worked
identify "$OUTPUT_DIR/${FILENAME_NOEXT}_trimmed.png"

# Step 2: Create standard logo sizes
echo "Creating standard logo sizes..."
# Website header logo (horizontal)
convert "$OUTPUT_DIR/${FILENAME_NOEXT}_trimmed.png" -resize x50 "$OUTPUT_DIR/${FILENAME_NOEXT}_header.png" || handle_error "header resize" "convert resize x50"

# Square logos for various uses
for size in 32 64 128 256 512; do
    echo "Creating ${size}x${size} logo..."
    convert "$OUTPUT_DIR/${FILENAME_NOEXT}_trimmed.png" -resize ${size}x${size} -background none -gravity center -extent ${size}x${size} "$OUTPUT_DIR/${FILENAME_NOEXT}_${size}x${size}.png" || handle_error "square resize ${size}" "convert resize ${size}x${size}"
done

# Step 3: Create social media sizes
echo "Creating social media sizes..."
# Facebook/LinkedIn (1200x630)
convert "$OUTPUT_DIR/${FILENAME_NOEXT}_trimmed.png" -resize 1200x630\> -background none -gravity center -extent 1200x630 "$OUTPUT_DIR/${FILENAME_NOEXT}_social.png" || handle_error "social media resize" "convert social"

# Twitter/X (1500x500)
convert "$OUTPUT_DIR/${FILENAME_NOEXT}_trimmed.png" -resize 1500x500\> -background none -gravity center -extent 1500x500 "$OUTPUT_DIR/${FILENAME_NOEXT}_twitter.png" || handle_error "twitter resize" "convert twitter"

# Step 4: Create favicon with multiple sizes
echo "Creating favicon..."
convert "$OUTPUT_DIR/${FILENAME_NOEXT}_trimmed.png" -background none -define icon:auto-resize=16,32,48,64 "$OUTPUT_DIR/${FILENAME_NOEXT}_favicon.ico" || handle_error "favicon creation" "convert favicon"

# Also create individual favicon PNGs for modern browsers
for size in 16 32 48 96 192; do
    echo "Creating favicon-${size}x${size}.png..."
    convert "$OUTPUT_DIR/${FILENAME_NOEXT}_trimmed.png" -resize ${size}x${size} "$OUTPUT_DIR/${FILENAME_NOEXT}_favicon-${size}.png" || handle_error "favicon png ${size}" "convert favicon-${size}"
done

# Disable debugging
set +x

echo "All done! Logo files saved to $OUTPUT_DIR"
echo "Main files created:"
echo "  - ${FILENAME_NOEXT}_trimmed.png (trimmed version)"
echo "  - ${FILENAME_NOEXT}_header.png (for website header)"
echo "  - ${FILENAME_NOEXT}_favicon.ico (for browser tab)"
echo "  - Various sized logos: 32x32, 64x64, 128x128, 256x256, 512x512"
echo "  - Social media optimized versions"