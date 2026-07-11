import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
];

for (const modelName of models) {
    try {
        console.log(`\nTesting ${modelName}...`);

        const model = genAI.getGenerativeModel({
            model: modelName,
        });

        const result = await model.generateContent("Say Hello");
        console.log("✅ SUCCESS:", modelName);
        console.log(result.response.text());
    } catch (err) {
        console.log("❌ FAILED:", modelName);
        console.log(err.message);
    }
}