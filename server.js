const express = require('express');
const https = require('https'); 

const app = express();
// Render अपने आप पोर्ट 3000 सेट कर लेगा
const port = process.env.PORT || 3000;

app.use(express.json());

// 1. होम रूट (सर्वर चेक करने के लिए)
app.get('/', (req, res) => {
    res.json({ success: true, message: "Suresh AI Server is Active on Render!" });
});

// 2. Suresh AI रूट (Groq / Llama 3 से कनेक्ट करने के लिए)
app.get('/api/suresh-ai', (req, res) => {
    const userPrompt = req.query.prompt || "Hello Suresh AI";
    
    // Llama 3 (Groq) को रिक्वेस्ट का डेटा
    const postData = JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: userPrompt }]
    });

    const options = {
        hostname: 'api.groq.com',
        port: 443,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY_GROQ}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const groqReq = https.request(options, (groqRes) => {
        let responseData = '';
        groqRes.on('data', (chunk) => { responseData += chunk; });
        groqRes.on('end', () => {
            try {
                const parsedData = JSON.parse(responseData);
                // Android ऐप को रिस्पॉन्स वापस भेजना
                res.json({
                    success: true,
                    question: userPrompt,
                    answer: parsedData.choices[0].message.content
                });
            } catch (e) {
                res.json({ success: false, question: userPrompt, answer: "API Error: अपनी Groq API Key चेक करें।" });
            }
        });
    });

    groqReq.on('error', (error) => {
        console.error("Connection Error:", error);
        res.json({ success: false, question: userPrompt, answer: "Server Error" });
    });

    groqReq.write(postData);
    groqReq.end();
});

// 3. सर्वर चालू रखने के लिए
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});