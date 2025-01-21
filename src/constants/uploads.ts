const baseURL = "https://dl.quranara.com";

export const Paths = {
    courses: {
        cover: `${baseURL}/courses/cover`,
        intro: `${baseURL}/courses/intro`,
    },

    blog: {
        cover: `${baseURL}/blog/cover`,
    },

    tv: {
        cover: `${baseURL}/tv/cover`,
        episodes: `${baseURL}/tv/episodes`,
        attachments: `${baseURL}/tv/attachments`,
    },

    sessions: {
        episodes: `${baseURL}/sessions/episodes`,
        attachments: `${baseURL}/sessions/attachments`,
    },

    news: {
        cover: `${baseURL}/news/cover`,
    },
} as const;
