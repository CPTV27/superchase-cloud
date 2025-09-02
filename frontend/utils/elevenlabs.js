import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Voice mappings from environment variables
const VOICE_MAP = {
  producer: process.env.VOICE_PRODUCER,
  engineer: process.env.VOICE_ENGINEER,
  concierge: process.env.VOICE_CONCIERGE,
  archivist: process.env.VOICE_ARCHIVIST,
  host: process.env.VOICE_HOST
};

// Ensure cache directory exists
const CACHE_DIR = path.join(__dirname, '..', 'audio-cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Check ElevenLabs API health
 */
export async function ttsHealth() {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not found in environment variables');
    }

    // Test API connectivity by fetching available voices
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      status: 'healthy',
      voicesAvailable: data.voices?.length || 0,
      apiKeyValid: true,
      configuredVoices: Object.keys(VOICE_MAP).filter(key => VOICE_MAP[key])
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      apiKeyValid: false
    };
  }
}

/**
 * Generate a voice clip with caching
 */
export async function getVoiceClip(voiceType, text, options = {}) {
  try {
    // Get voice ID
    const voiceId = VOICE_MAP[voiceType.toLowerCase()];
    if (!voiceId) {
      throw new Error(`Voice type '${voiceType}' not found. Available: ${Object.keys(VOICE_MAP).join(', ')}`);
    }

    // Generate cache filename
    const textHash = Buffer.from(text).toString('base64').replace(/[/+=]/g, '');
    const cacheFile = path.join(CACHE_DIR, `${voiceType}_${textHash.substring(0, 20)}.mp3`);
    
    // Check if cached version exists
    if (fs.existsSync(cacheFile)) {
      return {
        url: `file://${cacheFile}`,
        cached: true,
        voiceType,
        text: text.substring(0, 50) + (text.length > 50 ? '...' : '')
      };
    }

    // Generate new audio using API
    console.log(`Generating audio with voice ${voiceType} (${voiceId})...`);
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: options.model || 'eleven_multilingual_v2',
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarity_boost || 0.75,
          style: options.style || 0.0,
          use_speaker_boost: options.use_speaker_boost || true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Save to cache
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(cacheFile, audioBuffer);

    return {
      url: `file://${cacheFile}`,
      cached: false,
      voiceType,
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      sizeKB: Math.round(audioBuffer.length / 1024)
    };

  } catch (error) {
    throw new Error(`TTS generation failed: ${error.message}`);
  }
}

/**
 * Generate audio from text file
 */
export async function generateFromFile(textFilePath, voiceType, outputPath) {
  try {
    // Read text file
    const text = fs.readFileSync(textFilePath, 'utf-8');
    
    // Get voice clip (this will cache it automatically)
    const result = await getVoiceClip(voiceType, text);
    
    // Copy to desired output path if different
    if (outputPath && outputPath !== result.url.replace('file://', '')) {
      fs.copyFileSync(result.url.replace('file://', ''), outputPath);
      return { ...result, outputPath };
    }
    
    return result;
  } catch (error) {
    throw new Error(`File generation failed: ${error.message}`);
  }
}

/**
 * Get available voice types
 */
export function getAvailableVoices() {
  return Object.keys(VOICE_MAP).filter(key => VOICE_MAP[key]);
}

/**
 * Clear audio cache
 */
export function clearCache() {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    const audioFiles = files.filter(file => file.endsWith('.mp3'));
    audioFiles.forEach(file => {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    });
    return { cleared: audioFiles.length, status: 'success' };
  } catch (error) {
    return { error: error.message, status: 'error' };
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  try {
    const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.mp3'));
    const totalSize = files.reduce((sum, file) => {
      const filePath = path.join(CACHE_DIR, file);
      return sum + fs.statSync(filePath).size;
    }, 0);
    
    return {
      fileCount: files.length,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      cacheDir: CACHE_DIR
    };
  } catch (error) {
    return { error: error.message };
  }
}