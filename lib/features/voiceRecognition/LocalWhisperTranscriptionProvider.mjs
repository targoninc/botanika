import {whisper} from "whisper-node";
import fs from "fs";
import {execSync} from "child_process";
import {CLI} from "../../tooling/CLI.mjs";

export class LocalWhisperTranscriptionProvider {
    static async transcribe(file) {
        const options = {
            modelName: "medium",
            whisperOptions: {
                language: 'auto',         // default (use 'auto' for auto detect)
                gen_file_txt: false,      // outputs .txt file
                gen_file_subtitle: false, // outputs .srt file
                gen_file_vtt: false,      // outputs .vtt file
                word_timestamps: true     // timestamp for every word
                // timestamp_size: 0      // cannot use along with word_timestamps:true
            }
        }

        const filePath = `${file.path.split('.')[0]}.webm`;
        CLI.debug(`Writing file: ${filePath}`);
        fs.writeFileSync(filePath, file.buffer);

        CLI.debug(`Converting file to wav: ${filePath}`);
        const wavFilePath = await LocalWhisperTranscriptionProvider.convertToWav(filePath);
        if (!wavFilePath) {
            return "Error converting file to wav";
        }

        CLI.debug(`Transcribing file: ${wavFilePath}`);
        const transcript = await whisper(wavFilePath, options);

        CLI.debug(`Deleting files: ${filePath}, ${wavFilePath}`);
        fs.unlinkSync(wavFilePath);
        fs.unlinkSync(filePath);
        return transcript.text;
    }

    static async convertToWav(filePath) {
        const wavFilePath = `${filePath.split('.')[0]}.wav`;
        try {
            const command = `ffmpeg -i ${filePath} ${wavFilePath} -ac 1 -ar 16000 -y`;
            console.log("Executing command: " + command);
            execSync(command);
            return wavFilePath;
        } catch (error) {
            console.log({error});
            return null;
        }
    }
}