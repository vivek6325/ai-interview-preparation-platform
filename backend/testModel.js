import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
];

async function testModel(modelName) {
    try {
        console.log(`\nTesting ${modelName}...`);

        const model = genAI.getGenerativeModel({
            model: modelName,
        });

        const result = await model.generateContent("Say Hello");

        console.log("✅ SUCCESS");
        console.log(result.response.text());
    } catch (err) {
        console.log("❌ FAILED");
        console.log(err.message);
    }
}

(async () => {
    for (const model of models) {
        await testModel(model);
    }
})();