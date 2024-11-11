document.getElementById("submit-btn").addEventListener("click", async function () {
    const fileInput = document.getElementById("file-upload");
    const description = document.getElementById("text-input").value;
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Please select an image to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("description", description); // Add description to the form data

    try {
        const response = await fetch('http://ec2-3-144-122-137.us-east-2.compute.amazonaws.com:80/analyze-image', {
            method: 'POST',
            body: formData,
        });
        
        const data = await response.json();
        document.getElementById("response-output").innerText = data.response || "No response received.";
    } catch (error) {
        console.error("Error analyzing image:", error);
        document.getElementById("response-output").innerText = "Error analyzing image.";
    }
});