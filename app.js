const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

let conversationHistory = [
    { role: "system", content: "You are a helpful assistant." }
];

app.post("/ask", async (req, res) => {
    const userMessage = req.body.message;

    // Update conversation history with the user's message
    conversationHistory.push({ role: "user", content: userMessage });

    try {
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Generate response based on user's message
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const botResponse = await response.text();

        // Format the bot response message with line breaks and bold text
        const formattedBotResponse = formatResponse(botResponse);

        // Update conversation history with the assistant's response
        conversationHistory.push({ role: "assistant", content: botResponse });

        res.json({ message: formattedBotResponse });
    } catch (error) {
        console.error("Error calling Google Generative AI: ", error);
        res.status(500).json({ error: error.message });
    }
});

// Function to format response message with bold text
function formatResponse(response) {
    // Apply bold formatting to words between '*'
    return response.replace(/\*(.*?)\*/g, '$1');
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});