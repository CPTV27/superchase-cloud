import { getVoiceClip, ttsHealth, generateFromFile, getAvailableVoices } from "./utils/elevenlabs.js";
import fs from 'fs';

(async () => {
  console.log("🎙️  Testing ElevenLabs TTS Integration\n");

  try {
    // 1. Check environment variables
    console.log("1. Checking environment setup...");
    console.log("API Key present:", !!process.env.ELEVENLABS_API_KEY);
    console.log("Available voices:", getAvailableVoices());

    // 2. Health Check
    console.log("\n2. Checking API health...");
    const health = await ttsHealth();
    console.log("Health:", health);
    
    if (health.status !== 'healthy') {
      console.error("❌ API health check failed!");
      process.exit(1);
    }

    // 3. Test basic voice generation
    console.log("\n3. Testing voice generation...");
    const testText = "The first move is what sets everything in motion. Studio C voice test.";
    
    const { url, cached, sizeKB } = await getVoiceClip("producer", testText);
    console.log(`✅ Producer voice: ${cached ? "(cached)" : "(fresh)"} - ${sizeKB}KB`);
    console.log(`File saved: ${url.replace('file://', '')}`);

    // 4. Test file generation
    console.log("\n4. Testing file-based generation...");
    
    // Create test input file
    fs.writeFileSync("input.txt", "Welcome to SuperChase. Your task coordination system is online.");
    
    const fileResult = await generateFromFile("input.txt", "concierge", "output.mp3");
    console.log(`✅ File generation: ${fileResult.cached ? "(cached)" : "(fresh)"}`);
    
    // Cleanup
    if (fs.existsSync("input.txt")) fs.unlinkSync("input.txt");

    console.log("\n🎉 All tests passed! ElevenLabs integration working perfectly.");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
})();