import express from "express";
import type { Request, Response } from "express";
import { spawn } from "node:child_process";
import type { YtDlpInfo, DownloadRes } from "../types/index.js";

const IG_URL_REGEX = /^https?:\/\/(www\.)?instagram\.com\/.+/i;

function fetchInstagramInfo(url: string): Promise<YtDlpInfo> {
    return new Promise((resolve, reject) => {
        const proc = spawn("yt-dlp", ["--dump-json", "--no-playlist", url]);

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (chunk: Buffer) => (stdout += chunk.toString()));
        proc.stderr.on("data", (chunk: Buffer) => (stderr += chunk.toString()));

        proc.on("error", (err) => reject(err));

        proc.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
                return;
            }
            try {
                resolve(JSON.parse(stdout) as YtDlpInfo);
            } catch {
                reject(new Error("Failed to parse yt-dlp output"));
            }
        });
    });
}

const app = express();
const port: number = 8000;

app.get("/api/download", async (req: Request, res: Response) => {
    const url = req.query.url;

    if (typeof url !== "string" || !IG_URL_REGEX.test(url)) {
        res.status(400).json({ error: "Provide a valid Instagram URL as ?url=" });
        return;
    }

    try {
        const info = await fetchInstagramInfo(url);

        const payload: DownloadRes = {
            videoUrl: info.url ?? null,
            thumbnail: info.thumbnail ?? null,
            caption: info.description ?? info.title ?? "",
            uploader: info.uploader ?? info.uploader_id ?? null,
            likeCount: info.like_count ?? null,
            commentCount: info.comment_count ?? null,
            duration: info.duration ?? null,
            timestamp: info.timestamp ?? null,
        };

        res.json(payload);
    } catch (err) {
        res.status(502).json({
            error: "Failed to fetch content (post may be private, deleted, or invalid)",
            detail: err instanceof Error ? err.message : undefined,
        });
    }
});

app.get("/", (_req: Request, res: Response) => {
    res.json({ status: "ok", usage: "/api/download?url=<instagram-url>" });
});

app.listen(port, () => {
    console.log(`✅ [api] Instagram downloader API running on http://localhost:${port}`);
});