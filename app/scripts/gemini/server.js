import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
const port = 3000;

app.use(cors());

// Configure multer to handle files and parse text fields
const upload = multer({ dest: 'uploads/' });

// Function to upload a file to Gemini
async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
}

// Endpoint to handle image upload and get AI response
app.post('/analyze-image', upload.single('image'), async (req, res) => {
    try {
        const filePath = req.file.path; // Path to the uploaded image
        const mimeType = req.file.mimetype; // MIME type of the uploaded file
        const userDescription = req.body.description; // Retrieve additional description from form data

        console.log("User Description:", userDescription); // Check if description is being read

        // Upload the file to Gemini
        const geminiFile = await uploadToGemini(filePath, mimeType);

        // Prepare the prompt with the user description
        const promptText = userDescription
            ? `What is this image? ${userDescription}`
            : "What is this image?";

        // Start a chat session with Gemini including the uploaded file and the custom prompt
        const chatSession = model.startChat({
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain",
            },
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            fileData: {
                                mimeType: geminiFile.mimeType,
                                fileUri: geminiFile.uri,
                            },
                        },
                        { text: promptText },
                    ],
                },
            ],
        });

        // Get the response from the model
        const result = await chatSession.sendMessage("Analyze the content of the image.");
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "Error analyzing image." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
