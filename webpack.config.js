import path from "path";
import dotenv from "dotenv";
import HtmlWebpackPlugin from 'html-webpack-plugin';

dotenv.config();
const dirname = path.resolve();

export default {
    entry: {
        index: "./ui/index.mjs"
    },
    mode: "production",
    output: {
        filename: "[name].bundled.mjs",
        path: path.resolve(dirname, "dist"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './ui/index.html',
            chunks: ['index']
        })
    ]
};
