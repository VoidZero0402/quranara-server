const baseURL = "https://dl.quranara.com";

export const Paths = {
    courses: {
        cover: `${baseURL}/courses/cover`,
        content: `${baseURL}/courses/content`,
    },

    blog: {
        cover: `${baseURL}/blog/cover`,
        content: `${baseURL}/blog/content`,
    },

    tv: {
        cover: `${baseURL}/tv/cover`,
        content: `${baseURL}/tv/content`,
        attachments: `${baseURL}/tv/attachments`,
    },

    sessions: {
        episodes: `${baseURL}/sessions/episodes`,
        content: `${baseURL}/sessions/content`,
        attachments: `${baseURL}/sessions/attachments`,
    },

    news: {
        cover: `${baseURL}/news/cover`,
    },
} as const;
