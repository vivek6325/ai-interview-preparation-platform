import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
    console.log("Trying to list models...");

    try {
        const models = await genAI.listModels();
        console.log(models);
    } catch (err) {
        console.error("ERROR:");
        console.error(err);
    }
}

main();