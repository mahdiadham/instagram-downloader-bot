export interface Message {
    welcomeMessage: string;
    restartMessage: string;
    requestError: string;
    processMessage: string;
    invalidURL: string;
    serverError: string;
}

export interface DownloadResponse {
    download_url: string;
    caption: string;
    gallery: {
        expires_at: string;
    };
}
export interface YtDlpInfo {
    url?: string;
    thumbnail?: string;
    description?: string;
    title?: string;
    uploader?: string;
    uploader_id?: string;
    like_count?: number;
    comment_count?: number;
    duration?: number;
    timestamp?: number;
}
export interface DownloadRes {
    videoUrl: string | null;
    thumbnail: string | null;
    caption: string;
    uploader: string | null;
    likeCount: number | null;
    commentCount: number | null;
    duration: number | null;
    timestamp: number | null;
}