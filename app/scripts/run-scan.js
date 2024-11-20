document.getElementById("submit-btn").addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent default form submission if within a form

    // Retrieve the file input, description, and dropdown selections
    const fileInput = document.getElementById("file-upload");
    const descriptionInput = document.getElementById("text-input").value.trim();
    const fromAirportSelect = document.getElementById("from-airport");
    const toAirportSelect = document.getElementById("to-airport");
    const fromAirport = fromAirportSelect.value;
    const toAirport = toAirportSelect.value;
    const file = fileInput.files[0];

    // Basic Validation
    if (!file) {
        alert("Please select an image to upload.");
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
    // If description is provided, append it; otherwise, just include airports
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
    formData.append("image", file);
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
    } catch (error) {
        console.error("Error analyzing image:", error);
        responseOutput.innerText = "Error analyzing image.";
    }
});
