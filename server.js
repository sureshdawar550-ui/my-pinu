const express = require('express');
const axios = require('axios'); 

const app = express();
const port = 3000;

// JSON डेटा सपोर्ट के लिए
app.use(express.json());

// 1. होम रूट (सर्वर चेक करने के लिए)
app.get('/', (req, res) => {
    res.json({ success: true, message: "Suresh AI Server is Active!" });
});

// 2. Suresh AI रूट (Ollama से कनेक्ट करने के लिए)
app.get('/api/suresh-ai', async (req, res) => {
    const userPrompt = req.query.prompt || "Hello Suresh AI";
    
    try {
        // Llama 3 को सीधा और आसान रिक्वेस्ट
   const ollamaResponse = await axios.post('http://127.0.0.1:11434/api/generate', {   
            model: "llama3",
            prompt: userPrompt,
            stream: false
        });

        // Android ऐप को रिस्पॉन्स वापस भेजना
        res.json({
            success: true,
            question: userPrompt,
            answer: ollamaResponse.data.response
        });

    } catch (error) {
        console.error("Ollama Connection Error:", error.message);
        res.json({ 
            success: false, 
            message: "Ollama is not running. Please open CMD and run: ollama run llama3" 
        });
    }
});

// 3. सर्वर चालू रखने के लिए (0.0.0.0 लगाने से फोन से भी कनेक्ट होगा)
app.listen(3000, '0.0.0.0', () => {
    console.log("Server running on port 3000 and accessible on network");
});