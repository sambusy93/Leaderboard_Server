import { MultiGameItem, Platform } from "./API_Types";

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
    patch?: string,
    name?: string
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

export interface SingleLevelCategoryEntry {
    name: string,
    runs: number | undefined;
    id: string;
    level?: string
    extraSortVariables: extraSortStructure | null;
    "is-singleLevel": boolean | undefined;
    subCategories: Record<string, SubCatData>;
}

export interface MultiLevelCategoryEntry extends SingleLevelCategoryEntry {
    defaultSubCatID: string | null,
    defaultSubCatName: string | null
}

export interface CategoryDataStructure {
    categories: CategoriesWrapper,
    subcategories: SubcategoriesWrapper
}

export interface CategoriesWrapper {
    [key: string]: MultiLevelCategoryEntry | SingleLevelCategoryEntry
}

export interface SubcategoriesWrapper {
    [key: string]: SubCatData
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
    weblink: string;
    releaseDate: string;
    numberOfCategories: number;
    numberOfSubCategories: number;
    defaultCategoryInfo: DefaultCatInfoBySubCat | DefaultCatInfoByTopCat;
    assets: { [key in AssetType]: Asset | null };
}

export interface DefaultCatInfoBySubCat {
    parentName: string,
    parentID: string,
    subcatName: string,
    subcatID: string,
    combo: string
}

export interface DefaultCatInfoByTopCat {
    parentName: string,
    parentID: string,
    combo: string
}

export interface GameDataFinalized {
    gameData: GameData;
    categoryData: CategoryDataStructure
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
    Runners: Record<string, RunnerDataFinalized>,
    MultiGame: Record<string, MultiGameItem>,
    Platforms: Record<string, string>
}
