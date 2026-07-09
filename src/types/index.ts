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