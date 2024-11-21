document.addEventListener('DOMContentLoaded', function() {
    // Reference to the necessary elements
    const takePictureButton = document.getElementById('take-picture');
    const cameraModal = document.getElementById('camera-modal');
    const video = document.getElementById('video');
    const captureButton = document.getElementById('capture-btn');
    const closeCameraButton = document.getElementById('close-camera-btn');
    const fileUpload = document.getElementById('file-upload');
    const fileLabel = document.getElementById('file-label');
    
    // Variables to store the captured image
    let capturedImageBlob = null;
    let stream = null;
    
    // Event listener for "Take Picture" button
    takePictureButton.addEventListener('click', async function () {
        console.log('Take Picture button clicked');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support camera access.');
            return;
        }
    
        // Show the camera modal
        cameraModal.style.display = 'flex';
    
        // Request access to the camera
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.play();
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check your permissions and try again.');
            cameraModal.style.display = 'none';
        }
    });
    
    // Event listener for "Capture" button
    captureButton.addEventListener('click', function () {
        console.log('Capture button clicked');
        
        // Create a canvas to capture the current frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
        // Convert the canvas image to a blob
        canvas.toBlob(function (blob) {
            capturedImageBlob = blob;
    
            // Update the file label to indicate a picture was taken
            fileLabel.textContent = 'Image Captured';
    
            // Close the camera modal and stop the video stream
            stopCamera();
        }, 'image/jpeg');
    
    });
    
    // Event listener for "Close" button
    closeCameraButton.addEventListener('click', function () {
        console.log('Close Camera button clicked');
        // Close the camera modal and stop the video stream
        stopCamera();
    });
    
    // Function to stop the camera stream
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        video.srcObject = null;
        cameraModal.style.display = 'none';
    }
    
    // Event listener for file upload
    fileUpload.addEventListener('change', function () {
        const file = this.files[0]; // Get the first selected file
        if (file) {
            fileLabel.textContent = `Selected: ${file.name}`;
        } else {
            fileLabel.textContent = 'Choose an Image';
        }
    });
    
    // Submit Button Event Listener
    document.getElementById("submit-btn").addEventListener("click", async function (event) {
        event.preventDefault(); // Prevent default form submission if within a form
    
        // Retrieve the description and dropdown selections
        const descriptionInput = document.getElementById("text-input").value.trim();
        const fromAirportSelect = document.getElementById("from-airport");
        const toAirportSelect = document.getElementById("to-airport");
        const fromAirport = fromAirportSelect.value;
        const toAirport = toAirportSelect.value;
        const file = fileUpload.files[0];
    
        // Basic Validation
        if (!file && !capturedImageBlob) {
            alert("Please select an image to upload or take a picture.");
            return;
        }
    
        if (!fromAirport) {
            alert("Please select a departure airport.");
            return;
        }
    
        if (!toAirport) {
            alert("Please select a destination airport.");
            return;
        }
    
        // Combine the selected airports with the user's description
        let combinedDescription = `Please find whether this will be valid From: ${fromAirport}, To: ${toAirport} airports. Focus on whether it is an international flight or local flight if you do not know the specifics. Also, provide relevant links to the needed source if possible, however I want to use you just as a quick source for information, so do everything in your power to see if it passes regulations before telling me to search myself. I understand your response might not be perfect. Respond to this in a clean text format, no markdown.`;
        if (descriptionInput !== "") {
            combinedDescription += ` ${descriptionInput}`;
        }
    
        // Reference to the response output div
        const responseOutput = document.getElementById("response-output");
        
        // Display the "Thinking" animation
        responseOutput.innerHTML = `<span class="thinking">Thinking</span>`;
        
        // Remove any existing 'invalid' class for fresh feedback
        responseOutput.classList.remove("invalid");
    
        // Create a new FormData object and append the necessary data
        const formData = new FormData();
    
        // Append the image file or captured image blob
        if (capturedImageBlob) {
            formData.append("image", capturedImageBlob, 'captured_image.jpg');
        } else if (file) {
            formData.append("image", file);
        }
    
        formData.append("description", combinedDescription); // Add the combined description to the form data
    
        try {
            // Send a POST request to the server with the form data
            const response = await fetch('http://ec2-3-144-122-137.us-east-2.compute.amazonaws.com:80/analyze-image', {
                method: 'POST',
                body: formData,
            });
    
            // Check if the response status is within the success range
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
    
            // Parse the JSON response from the server
            const data = await response.json();
            
            // Check if the response starts with "invalid" (case-insensitive)
            if (String(data.response).toLowerCase().startsWith("invalid")) {
                responseOutput.classList.add("invalid");
            }
    
            // Display the server's response or a default message
            responseOutput.innerText = data.response || "No response received.";
    
            // Reset the captured image blob after submission
            capturedImageBlob = null;
            fileLabel.textContent = 'Choose an Image';
    
        } catch (error) {
            console.error("Error analyzing image:", error);
            responseOutput.innerText = "Error analyzing image.";
        }
    });
});
