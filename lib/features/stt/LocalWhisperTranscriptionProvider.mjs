import {whisper} from "whisper-tnode";
import fs from "fs";
import {execSync} from "child_process";
import {CLI} from "../../tooling/CLI.mjs";

export class LocalWhisperTranscriptionProvider {
    static async transcribe(file) {
        const options = {
            modelName: "base",
            whisperOptions: {
                language: 'auto',         // default (use 'auto' for auto detect)
                gen_file_txt: true,      // outputs .txt file
                gen_file_subtitle: false, // outputs .srt file
                gen_file_vtt: false,      // outputs .vtt file
                word_timestamps: true     // timestamp for every word
                // timestamp_size: 0      // cannot use along with word_timestamps:true
            }
        }

        const filePath = `tmp/toTranscribe_tmp.mp3`;
        CLI.debug(`Writing file: ${filePath}`);
        fs.writeFileSync(filePath, file.buffer);

        CLI.debug(`Converting file to wav: ${filePath}`);
        const wavFilePath = await LocalWhisperTranscriptionProvider.convertToWav(filePath);
        if (!wavFilePath) {
            return "Error converting file to wav";
        }
        const currentDir = process.cwd();
        const absoluteWaveFilePath = process.cwd() + '/' + wavFilePath;

        CLI.debug(`Transcribing file: ${absoluteWaveFilePath}`);
        const transcript = await whisper({
            filePath: absoluteWaveFilePath,
            options
        });

        CLI.debug(`Deleting files: ${filePath}, ${wavFilePath}`);
        process.chdir(currentDir);
        //fs.unlinkSync(wavFilePath);
        fs.unlinkSync(filePath);
        CLI.object(transcript);
        return transcript.join(' ');
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