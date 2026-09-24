const express = require('express');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Suresh AI Server is Active on Render!"
    });
});

app.get('/api/suresh-ai', (req, res) => {
    const userPrompt = req.query.prompt || "Hello Suresh AI";

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            success: false,
            answer: "GROQ_API_KEY Render में सेट नहीं है।"
        });
    }

    const postData = JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "user",
                content: userPrompt
            }
        ]
    });

    const options = {
        hostname: 'api.groq.com',
        port: 443,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const groqReq = https.request(options, (groqRes) => {
        let responseData = '';

        groqRes.on('data', (chunk) => {
            responseData += chunk;
        });

        groqRes.on('end', () => {
            try {
                const parsedData = JSON.parse(responseData);

                if (parsedData.error) {
                    return res.status(200).json({
                        success: false,
                        question: userPrompt,
                        answer: "Groq Error: " + parsedData.error.message
                    });
                }

                res.json({
                    success: true,
                    question: userPrompt,
                    answer: parsedData.choices[0].message.content
                });

            } catch (error) {
                res.status(500).json({
                    success: false,
                    question: userPrompt,
                    answer: "API Error: जवाब समझने में दिक्कत हुई।"
                });
            }
        });
    });

    groqReq.on('error', (error) => {
        console.error("Connection Error:", error);

        res.status(500).json({
            success: false,
            question: userPrompt,
            answer: "Server Error"
        });
    });

    groqReq.write(postData);
    groqReq.end();
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
