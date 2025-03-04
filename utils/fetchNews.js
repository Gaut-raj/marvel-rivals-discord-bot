const axios = require("axios");
const cheerio = require("cheerio");

// Function fetch latest marvel rivals news
async function fetchMarvelAnnouncements() {
    try {
        const response = await axios.get("https://www.marvelrivals.com/news");
        const html = response.data;
        const $ = cheerio.load(html);

        let announcements = [];

        $(".list-item").each((index, element) => { 
            let title = $(element).find("h2").text().trim();
            let link = $(element).attr("href"); 
            let description = $(element).find("p").text().trim();
            let image = $(element).find("img").attr("src");

            if (link && !link.startsWith("http")) {
                link = `https://www.marvelrivals.com${link}`;
            }

            announcements.push({ title, link, description, image });
        });

        console.log("📢 Announcements:", announcements);
        return announcements;

    } catch (error) {
        console.error("❌ Error fetching Marvel Rivals announcements:", error);
        return []; 
    }
}

// 🌟 Function to fetch API Data from multiple endpoints
async function fetchMarvelAPIData() {
    const endpoints = {
        "Item by ID": "https://mrapi.org/api/item/example",
        "Leaderboards": "https://mrapi.org/api/leaderboards/example",
        "Maps": "https://mrapi.org/api/maps",
        "Match by ID": "https://mrapi.org/api/match/example",
        "Player Info": "https://mrapi.org/api/player/example",
        "Player ID by Name": "https://mrapi.org/api/player-id/example",
        "Player Matches": "https://mrapi.org/api/player-match/example",
        "Update Player": "https://mrapi.org/api/player-update/example",
        "All Ranks": "https://mrapi.org/api/ranks",
        "All Hero Skins": "https://mrapi.org/api/skins",
    };

    for (const [name, url] of Object.entries(endpoints)) {
        try {
            const response = await axios.get(url);
            console.log(`✅ ${name}:`, response.data);
        } catch (error) {
            console.error(`❌ Error fetching ${name}:`, error);
        }
    }
}

// Run both functions
(async () => {
    await fetchMarvelAnnouncements();
    await fetchMarvelAPIData();
})();
