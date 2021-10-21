import { AssetType, Asset } from "./Cache_Interface";

export interface APIGameResponse {
    data: APIGameData;
}

export interface APIGameData {
    id: string;
    names: {
        international: string;
        japanese: string | null;
        twitch: string;
    }
    abbreviation: string;
    weblink: string;
    released: number;
    'release-date': string;
    ruleset: {
        'show-milliseconds': boolean;
        'require-verification': boolean;
        'require-video': boolean;
        'run-times': string[];
        'default-time': string;
        'emulators-allowed': boolean;
    }
    romhack: boolean;
    gametypes: string[];
    platforms: string[];
    regions: string[];
    genres: string[];
    engines: string[];
    developers: string[];
    publishers: string[];
    moderators: Record<string, string>;
    created: string;
    assets: { [key in AssetType]: Asset | null };
    links: Links[];
    categories: {
        data: APICategoryData[];
    }
}

export interface Links {
    rel: string;
    uri: string;
}

export interface APICategoryData {
    id: string;
    name: string;
    weblink: string;
    type: string;
    rules: string;
    players: {
        type: string;
        value: number;
    }
    miscellaneous: boolean;
    links: Links[];
    variables: {
        data: Array<SubCategory>;
    }
}

export interface SubCategory {
    id: string;
    name: string;
    category: null;
    scope: {
        type: string;
    };
    mandatory: boolean;
    'user-defined': boolean;
    obsoletes: boolean;
    values: {
        _note: string;
        choices: Record<string, string>;
        values: Record<string, Record<string, any>>;
        default: string;
    };
    links: Links[];
    'is-subcategory': boolean;
}

export interface APICategoryLeaderboardWrapper {
    data: APICategoryLeaderboardData;
}

export interface APICategoryLeaderboardData {
    weblink: string;
    game: string;
    cetegory: string;
    level: string;
    platform: string | null;
    region: string | null;
    emulators: string | null;
    'video-only': boolean;
    timing: string;
    values: Record<string, string>;
    runs: APIRunData[];
}

export interface APIRunData {
    place: number;
    run: {
        id: string;
        weblink: string;
        game: string;
        level: string | null;
        category: string;
        videos: {
            links: { uri: string; }[];
        };
        comment: string | null;
        status: {
            status: string;
            examiner: string;
            'verify-date': string;
        }
        players: {
            rel: string;
            id: string;
            uri: string;
        }[];
        date: string;
        submitted: string;
        times: {
            primary: string | null;
            primary_t: number | null;
            realtime: string | null;
            realtime_t: number;
            realtime_noloads: string | null;
            realtime_noloads_t: number;
            ingame: string | null;
            ingame_t: number | null;
        }
        system: {
            platform: string;
            emulated: boolean;
            region: string | null;
        }
        splits: Record<string, string | number> | null;
        values: Record<string, string>;
    }
}

export interface RunnerDataWrapper {
    data: RunnerDataStructure;
}

export interface RunnerDataStructure {
    id: string;
    names: {
        international: string,
        japanese: string
    },
    pronouns: string,
    weblink: string,
    'name-style': {
        style: string,
        'color-from': {
            light: string,
            dark: string
        },
        'color-to': {
            light: string,
            dark: string
        }
    },
    role: string,
    signup: string,
    location: {
        country: {
            code: string,
            names: {
                international: string,
                japanese: string | null
            }
        },
        region: {
            code: string,
            names: {
                international: string,
                japanese: string | null
            }
        }
    },
    twitch: {
        uri: string
    },
    hitbox: string | null,
    youtube: string | null,
    twitter: string | null,
    speedrunslive: string | null,
    assets: {
        icon: {
            uri: string | null
        },
        image: {
            uri: string
        }
    },
    links: [
        {
            rel: string,
            uri: string
        },
        {
            rel: string,
            uri: string
        },
        {
            rel: string,
            uri: string
        },
        {
            rel: string,
            uri: string
        }
    ]
}