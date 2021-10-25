export interface extraSortVariable {
    id: string;
    name: string,
    choices: Record<string, string>
}

export interface extraSortStructure {
    [key: string]: extraSortVariable;
}

export interface SortVariables {
    timewithloads: number,
    timewithoutloads: number,
    platform: string,
    category: string,
    subcategory: string,
    date: string,
    patch?: string
}

export interface ExtraSortVariableEntries {
    [key: string]: string | number;
}

export type AllSortVariables = SortVariables & ExtraSortVariableEntries;

export interface FullRunData {
    rank: number;
    runner: {
        id: string;
        uri: string;
        values: Record<string, string>;
        sortVariables: AllSortVariables;
    }
    ids: {
        category: string;
        subcategory: string;
        platform: string;
    }
}

export interface SubCatData {
    name: string;
    id: string;
    defaultID: string | null;
    defaultName: string | undefined;
    parentCategoryName: string;
    parentCategoryId: string;
    extraSortVariables: extraSortStructure;
    runs: FullRunData[];
}


export interface InnerSubCatDataStructure {
    [key: string]: SubCatData
}

export interface CategoryEntryData {
    runs: number | undefined;
    name: string;
    id: string;
    defaultSubCatID: string | null;
    defaultSubCatName: string | null;
    extraSortVariables: extraSortStructure | null;
    subCategories: Record<string, SubCatData>;
}

export interface CategoryDataStructure {
    [key: string]: CategoryEntryData;
}

export interface CategoryDataFinalized {
    categories: CategoryDataStructure,
    subcategories: InnerSubCatDataStructure
}

export interface Asset {
    uri: string;
    width: number;
    height: number;
}

export enum AssetType {
    LOGO = 'logo',
    COVER_TINY = 'cover-tiny',
    COVER_SMALL = 'cover-small',
    COVER_MEDIUM = 'cover-medium',
    COVER_LARGE = 'cover-large',
    ICON = 'icon',
    TROPHY_1ST = 'trophy-1st',
    TROPHY_2ND = 'trophy-2nd',
    TROPHY_3RD = 'trophy-3rd',
    TROPHY_4TH = 'trophy-4th',
    BACKGROUND = 'background',
    FOREGROUND = 'foreground'
}

export interface GameData {
    uniqueRunners?: number;
    name: string;
    abbreviation: string;
    id: string;
    releaseDate: string;
    numberOfCategories: number;
    numberOfSubCategories: number;
    defaultCategoryInfo: DefaultCatInfo;
    assets: { [key in AssetType]: Asset | null };
}

export interface DefaultCatInfo {
    parentName: string,
    parentID: string,
    subcatName: string,
    subcatID: string,
    combo: string
}

export interface GameDataFinalized {
    gameData: GameData;
    categoryData: CategoryDataFinalized
}

export interface RunnerDataFinalized {
    id: string,
    name: string,
    styleLight?: {
        'font-size': string,
        'margin-bottom': string,
        background: string,
        'background-clip': string,
        '-webkit-background-clip': string,
        '-moz-background-clip': string,
        '-moz-text-fill-color': string,
        '-webkit-text-fill-color': string,
        'background-size': string
    },
    styleDark?: {
        'font-size': string,
        'margin-bottom': string,
        background: string,
        'background-clip': string,
        '-webkit-background-clip': string,
        '-moz-background-clip': string,
        '-moz-text-fill-color': string,
        '-webkit-text-fill-color': string,
        'background-size': string
    }
}

export interface ServerCache {
    Games: Record<string, GameDataFinalized>,
    Runners: Record<string, RunnerDataFinalized>
}