const openCameraButton = document.getElementById('open-camera');
const video = document.getElementById('camera-preview');
const canvas = document.getElementById('canvas');
let stream;
let capturedFile;

// Open the camera when the "Take a Photo" button is clicked
openCameraButton.addEventListener('click', async (event) => {
    event.preventDefault();

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = 'block';
        openCameraButton.style.display = 'none';
    } catch (error) {
        console.error("Error accessing the camera:", error);
        alert("Camera access is required to take a photo.");
    }
});

// Capture the photo when the video element is clicked
video.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    stream.getTracks().forEach(track => track.stop());
    video.style.display = 'none';
    openCameraButton.style.display = 'block';

    canvas.toBlob((blob) => {
        capturedFile = new File([blob], "photo.jpg", { type: 'image/jpeg' });
        submitPhoto(capturedFile);
    });
});

// Function to handle the upload and display the response image
async function submitPhoto(file) {
    const descriptionBox = document.getElementById("text-input");

    if (!file) {
        alert("Please select or take a photo to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch('http://ec2-3-144-122-137.us-east-2.compute.amazonaws.com:80/analyze-image', {
            method: 'POST',
            body: formData,
        });

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            descriptionBox.value = data.description || "No description available.";
            document.getElementById("response-output").innerText = data.response || "No response received.";

            // Draw highlight if coordinates are provided
            if (data.highlight) {
                drawHighlight(data.highlight);
            }
        } else if (contentType && contentType.startsWith('image/')) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            let resultImage = document.getElementById("result-image");
            if (!resultImage) {
                resultImage = document.createElement("img");
                resultImage.id = "result-image";
                document.getElementById("image-container").appendChild(resultImage);
            }
            resultImage.src = imageUrl;
            document.getElementById("response-output").innerText = "Image analyzed and highlighted.";
            descriptionBox.value = "Highlighted item in the image.";
        } else {
            document.getElementById("response-output").innerText = "Unexpected response format.";
        }
    } catch (error) {
        console.error("Error analyzing image:", error);
        document.getElementById("response-output").innerText = "Error analyzing image.";
    }
}

// Function to draw highlight on the image
function drawHighlight(highlight) {
    const { x, y, radius } = highlight; // Assume backend returns x, y, radius of the highlighted item

    // Create an overlay canvas
    const overlayCanvas = document.createElement("canvas");
    overlayCanvas.id = "highlight-overlay";
    overlayCanvas.width = document.getElementById("result-image").width;
    overlayCanvas.height = document.getElementById("result-image").height;
    overlayCanvas.style.position = "absolute";
    overlayCanvas.style.top = "0";
    overlayCanvas.style.left = "0";
    overlayCanvas.style.pointerEvents = "none"; // Let clicks pass through the overlay
    document.getElementById("image-container").appendChild(overlayCanvas);

    const ctx = overlayCanvas.getContext("2d");
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;

    // Draw circle around the highlighted item
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
}
