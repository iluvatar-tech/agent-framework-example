import BaseTool from './base';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

export default class AudioGrabber extends BaseTool {
  private openai: OpenAI;

  constructor(config: any) {
    super(config);
    this.name = 'AudioGrabber';
    this.description = 'Downloads the chosen MP3/MP4 and turns the audio -> text using OpenAI Whisper API.';
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Get the parameter schema for the tool
   * @returns The parameter schema
   */
  getParameterSchema(): Record<string, any> {
    return {
      type: 'object',
      properties: {
        audioURL: {
          type: 'string',
          description: 'The URL of the audio file (MP3/MP4) to download and transcribe.',
        },
      },
      required: ['audioURL'],
    };
  }

  /**
   * Execute the tool with the given parameters
   * @param params - Parameters for the tool execution
   * @returns The result of the tool execution (transcribed text)
   */
  async execute(params: Record<string, any> = {}): Promise<any> {
    const { audioURL } = params;

    if (!audioURL) {
      throw new Error('audioURL parameter is required.');
    }

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const audioFileName = path.basename(audioURL);
    const tempFilePath = path.join(tempDir, audioFileName);

    try {
      // 1. Download the audio file
      const response = await axios({
        method: 'get',
        url: audioURL,
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Downloaded audio to: ${tempFilePath}`);

      // 2. Transcribe the audio using OpenAI Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
      });

      console.log('Transcription successful.');
      return transcription.text;

    } catch (error) {
      console.error('Error in AudioGrabber execution:', error);
      throw error;
    } finally {
      // Clean up the temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log(`Cleaned up temporary file: ${tempFilePath}`);
      }
    }
  }
}
