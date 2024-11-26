const upload = document.getElementById('upload');
const originalCanvas = document.getElementById('originalCanvas');
const editedCanvas = document.getElementById('editedCanvas');
const originalCtx = originalCanvas.getContext('2d');
const editedCtx = editedCanvas.getContext('2d');

let originalImage = null;

// Load and display the uploaded image
upload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalCanvas.width = editedCanvas.width = img.width;
        originalCanvas.height = editedCanvas.height = img.height;

        // Draw the original image on both canvases
        originalCtx.drawImage(img, 0, 0);
        editedCtx.drawImage(img, 0, 0);

        originalImage = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Apply grayscale filter
document.getElementById('grayscale').addEventListener('click', () => {
  applyFilter((r, g, b) => {
    const avg = (r + g + b) / 3;
    return [avg, avg, avg];
  });
});

// Apply blur filter
document.getElementById('blur').addEventListener('click', () => {
  applyBlur();
});

// Reset the edited canvas
document.getElementById('reset').addEventListener('click', () => {
  if (originalImage) {
    editedCtx.putImageData(originalImage, 0, 0);
  }
});

// Function to apply pixel-based filters
function applyFilter(filterFn) {
  const imageData = editedCtx.getImageData(0, 0, editedCanvas.width, editedCanvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const [r, g, b] = filterFn(
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2]
    );
    imageData.data[i] = r;
    imageData.data[i + 1] = g;
    imageData.data[i + 2] = b;
  }
  editedCtx.putImageData(imageData, 0, 0);
}

// Blur function
function applyBlur() {
  const imageData = editedCtx.getImageData(0, 0, editedCanvas.width, editedCanvas.height);
  const tempData = editedCtx.getImageData(0, 0, editedCanvas.width, editedCanvas.height);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;

      let r = 0, g = 0, b = 0, count = 0;
      const neighbors = [
        -width - 1, -width, -width + 1,
        -1, 0, 1,
        width - 1, width, width + 1,
      ];

      neighbors.forEach((offset) => {
        const ni = i + offset * 4;
        r += tempData.data[ni];
        g += tempData.data[ni + 1];
        b += tempData.data[ni + 2];
        count++;
      });

      imageData.data[i] = r / count;
      imageData.data[i + 1] = g / count;
      imageData.data[i + 2] = b / count;
    }
  }

  editedCtx.putImageData(imageData, 0, 0);
}