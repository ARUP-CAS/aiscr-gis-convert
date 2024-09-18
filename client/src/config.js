export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB v bytech

export const SUPPORTED_EXTENSIONS = {
    required: ['.shp', '.dbf'],
    optional: ['.prj', '.cpg']
};

// Nastavení URL pro API podle aktuálního prostředí
// Řešení nahrazuje .env soubor development a production
// Aplikace je nasazena na dvou různých doménách
export const API_URL = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_URL  // Použije URL z .env.development
    : window.location.hostname === "shptowkt.geogrep.cz"
        ? "https://shptowkt.geogrep.cz"
        : "https://amcr-convert.aiscr.cz"; // Dynamicky podle produkční domény
