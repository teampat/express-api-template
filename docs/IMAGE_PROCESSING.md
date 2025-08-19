# Image Processing Feature

The Express.js API Template now includes powerful image processing capabilities using the Sharp library. This feature allows you to automatically resize images, adjust quality, and convert formats during file uploads.

## Features

- **Enable/Disable Processing**: Control via environment variables
- **Image Resizing**: Automatically resize uploaded images to specified dimensions
- **Quality Adjustment**: Compress images to optimize file size
- **Format Conversion**: Convert images to JPG, WebP, AVIF, or PNG
- **Auto-conversion**: Automatic format conversion for all uploads
- **Maximum Dimensions**: Enforce size limits to prevent oversized images
- **Format Support**: Supports JPEG, PNG, and WebP image formats
- **Automatic Processing**: Only processes image files, other file types are left unchanged
- **Error Handling**: Graceful fallback to original file if processing fails

## Environment Configuration

Add these variables to your `.env` file:

```bash
# Image Processing Configuration
IMAGE_RESIZE=true                      # Enable/disable image processing
IMAGE_MAX_WIDTH=2048                   # Maximum allowed width in pixels
IMAGE_MAX_HEIGHT=2048                  # Maximum allowed height in pixels  
IMAGE_QUALITY=80                       # Default quality (1-100)
IMAGE_CONVERT=false                    # Auto-convert all images
IMAGE_CONVERT_FORMAT=jpg               # Default conversion format (jpg, webp, avif, png)
```

### Configuration Options

- **IMAGE_RESIZE**: Set to `false` to disable all image processing
- **IMAGE_MAX_WIDTH/HEIGHT**: Images exceeding these dimensions will be auto-resized
- **IMAGE_QUALITY**: Used when no quality parameter is provided
- **IMAGE_CONVERT**: When `true`, converts all uploaded images to specified format
- **IMAGE_CONVERT_FORMAT**: Target format for auto-conversion (`jpg`, `webp`, `avif`, `png`)

## Usage

### Single File Upload with Processing

```bash
# Upload and resize to 800x600
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "resize=800x600"

# Upload and set quality to 75%
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "quality=75"

# Upload with resize, quality and format conversion
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "resize=1200x800" \
  -F "quality=85" \
  -F "convert=webp"

# Convert to AVIF format
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.png" \
  -F "convert=avif" \
  -F "quality=90"
```

### Multiple Files Upload with Processing

```bash
curl -X POST http://localhost:3000/api/upload/multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "resize=1024x768" \
  -F "quality=80" \
  -F "convert=webp"
```

### JavaScript/Frontend Example

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('resize', '800x600');
formData.append('quality', '85');
formData.append('convert', 'webp');

fetch('/api/upload/single', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Upload successful:', data);
  // data.file.processed indicates if image was processed
  // data.file.url contains the URL to the uploaded file
});
```

## API Response

When image processing is enabled, the API response includes additional information:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "processed_1629123456789_image.webp",
    "originalName": "image.jpg",
    "size": 156789,
    "mimetype": "image/webp",
    "url": "/uploads/processed_1629123456789_image.webp",
    "processed": true
  }
}
```

## Parameters

### Resize Parameter

- **Format**: `{width}x{height}` (e.g., "800x600", "1920x1080")
- **Validation**: Automatically limited by `IMAGE_MAX_WIDTH` and `IMAGE_MAX_HEIGHT`
- **Behavior**: 
  - Maintains aspect ratio
  - Uses `fit: 'inside'` to ensure image fits within dimensions
  - Uses `withoutEnlargement: true` to prevent upscaling small images

### Quality Parameter

- **Range**: 1-100 (percentage)
- **Default**: Uses `IMAGE_QUALITY` from environment
- **JPEG**: Direct quality value (1-100)
- **PNG**: Converted to Sharp's 0-9 scale internally
- **WebP**: Direct quality value (1-100)
- **AVIF**: Direct quality value (1-100)

### Convert Parameter

- **Supported formats**: `jpg`, `jpeg`, `png`, `webp`, `avif`
- **Behavior**: Converts image to specified format
- **File extension**: Automatically updated to match new format
- **Quality**: Applied according to target format specifications

### Auto-conversion

When `IMAGE_CONVERT=true`:
- All uploaded images are converted to `IMAGE_CONVERT_FORMAT`
- Quality defaults to `IMAGE_QUALITY`
- Original format is ignored
- File extensions are updated automatically

## Technical Implementation

### Service Layer Architecture

The image processing is implemented in the service layer (`src/services/fileService.js`):

```javascript
// Resize image
if (resize) {
  const [width, height] = resize.split('x').map(Number);
  if (width && height) {
    sharpInstance = sharpInstance.resize(width, height, { 
      fit: 'inside', 
      withoutEnlargement: true 
    });
  }
}

// Set quality based on format
if (quality && file.mimetype === 'image/jpeg') {
  sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
}
```

### Error Handling

If image processing fails:
1. Error is logged using Winston logger
2. Original file is preserved
3. Processing continues without interruption
4. Response indicates `processed: false`

### File Management

1. Creates temporary processed file with `processed_` prefix
2. Replaces original file with processed version
3. Updates file size information
4. Cleans up temporary files on error

## Dependencies

- **Sharp**: High-performance image processing library
- **Multer**: File upload middleware (already included)
- **Winston**: Logging (already included)

## Installation Notes

Sharp was installed with the `--ignore-scripts` flag to avoid build issues:

```bash
npm install sharp --ignore-scripts
```

## Performance Considerations

- Image processing is CPU-intensive
- Large images may take longer to process
- Consider implementing job queues for high-volume applications
- Monitor memory usage with large image files

## Supported File Types

- **JPEG/JPG**: Full support for resize and quality
- **PNG**: Full support for resize and quality  
- **WebP**: Full support for resize and quality
- **Other formats**: No processing applied, uploaded as-is

## Configuration

Image processing is automatically enabled when:
1. Sharp library is available
2. `resize` or `quality` parameters are provided
3. Uploaded file is an image format

No additional configuration is required in environment variables.
