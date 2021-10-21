import { APIGameResponse, APICategoryData } from '../Interfaces_And_Types/API_Types';
import { CategoryDataFinalized, CategoryDataStructure, GameDataFinalized, InnerSubCatDataStructure, SubCatData } from '../Interfaces_And_Types/Cache_Interface';
import { getRunData } from './Calls';


///////////////////////////////
// Modify data from API call //
///////////////////////////////
export function addRunCountToCategoryObjects(data: GameDataFinalized): GameDataFinalized {
    if (!data.categoryData.categories || !data.categoryData.subcategories) { console.log('addRunCountToCategoryObjects did not recieve proper data'); return {} as GameDataFinalized; }

    let runCounter = 0;
    const catData = data.categoryData.categories;
    const categories = Object.values(catData);
    const subCatsWithVariable = Object.values(data.categoryData.subcategories);
    const subcats = subCatsWithVariable.filter(entry => entry.name);

    for (const category of categories) {
        for (const subcat of subcats) {
            if (!subcat.parentCategoryId) {
                continue; //if there is no id property then there were only sorting variables, no runs to add
            }
            runCounter += subcat.runs.length;
        }
        data.categoryData.categories[category.id].runs = runCounter;
    }

    return data;
}


export function countUniqueRunners(data: GameDataFinalized): number {
    const allRunners = [];
    const subCatsKeyedByID = Object.values(data.categoryData.subcategories);

    for (let i = 0; i < subCatsKeyedByID.length; i++) {
        const subcat = subCatsKeyedByID[i];
        const { runs } = subcat;
        allRunners.push(runs);
    }

    const uniqueRunners = new Set(allRunners);
    return uniqueRunners.size;
}



export async function findDefaultCategory(categoryData: CategoryDataFinalized, sorter?: string): Promise<string> {
    const subCatsWithVariable = Object.values(categoryData.subcategories);
    const subCats = subCatsWithVariable.filter(entry => entry.name);

    let subCatsSortedByAmountOfRuns: SubCatData[] = [];

    for (let i = 0; i < subCats.length; i++) {
        subCatsSortedByAmountOfRuns = subCats.sort((a, b) => {
            if (a.runs === undefined) { return 1; }
            if (b.runs === undefined) { return -1; }
            return b.runs.length - a.runs.length;
        }).slice(0, 1);
    }

    const [topSubCategory] = subCatsSortedByAmountOfRuns;
    const { parentCategoryId } = topSubCategory;

    if (sorter === 'combo') { return `${categoryData.categories[parentCategoryId].name} - ${topSubCategory.name}`; }
    return parentCategoryId;
}

export async function handleGameData(someData: APIGameResponse): Promise<GameDataFinalized> {
    //handle single-level or broken links
    if (!someData.data) { console.log('someData.data in handleGameData() failed '); return {} as GameDataFinalized; }

    //call the handleData function first so we can access some of their info 
    const categoryData = await handleCatData(someData.data.categories.data);

    const outputData = {
        gameData: {
            name: someData.data.names.twitch,
            abbreviation: someData.data.abbreviation,
            id: someData.data.id,
            releaseDate: someData.data['release-date'],
            numberOfCategories: Object.keys(categoryData).length,
            numberOfSubCategories: Object.keys(categoryData.subcategories).length,
            mainParentCategory: await findDefaultCategory(categoryData),
            topCategoryCombo: await findDefaultCategory(categoryData, 'combo'),
            assets: someData.data.assets
        },
        categoryData,
    };

    return outputData;
}

async function handleCatData(catData: APICategoryData[]): Promise<CategoryDataFinalized> {
    const outputData = { subcategories: {} } as CategoryDataFinalized;
    const categories: CategoryDataStructure = {};

    for (const category in catData) {
        const { name, id } = catData[category];
        //ADD CHECK FOR SINGLE LEVEL SUBCATEGORIES HERE.
        const finishedSubCatInfo = handleSubCatData(catData[category]);// {{subCatID: {SUBCATINFO}, ...}, {...}}
        if (finishedSubCatInfo.isSingleLevel) { continue; }
        const subCatKeys = Object.keys(finishedSubCatInfo);
        const [firstEntry] = subCatKeys;
        const defaultSubCategory = finishedSubCatInfo[firstEntry];
        categories[id] = {
            name,
            id,
            runs: undefined,
            defaultSubCatID: defaultSubCategory.id,
            defaultSubCatName: defaultSubCategory.name,
            extraSortVariables: defaultSubCategory.extraSortVariables,
            subCategories: finishedSubCatInfo
        };

        outputData.subcategories = finishedSubCatInfo;
    }

    outputData.categories = categories;
    return outputData;
}

function handleSubCatData(categoryData: APICategoryData): InnerSubCatDataStructure {
    const dataHolder: Record<string, any> = {};
    const { name, id, variables } = categoryData;

    const possibleSubCategories = variables.data;
    const extraSortVariables: Record<string, any> = {};

    for (let i = 0; i < possibleSubCategories.length; i++) {
        const entry = possibleSubCategories[i];
        const subcatIDs = Object.keys(entry.values.values);
        //if 'is-subcategory' is false it means its should be a column on the leaderboard 
        //so we add a field and include the values
        if (entry['is-subcategory'] === false) {
            const { choices } = entry.values;
            extraSortVariables[entry.id] = {
                name: entry.name,
                id: entry.id,
                choices
            };
            dataHolder.variables = extraSortVariables;
        }
        else if (entry.scope.type === 'single-level') { dataHolder.isSingleLevel = true; }
        //otherwise, its a proper subcategory and we need the relevant info
        else {
            for (let c = 0; c < subcatIDs.length; c++) {
                const subCatid = subcatIDs[c];
                const subCatname = entry.values.values[subCatid].label;
                const defaultID = entry.values.default;
                dataHolder[subCatid] = {
                    id: subCatid,
                    name: subCatname,
                    defaultID,
                    defaultName: entry.values.default ? entry.values.values[defaultID].label : undefined,
                    parentCategoryName: name,
                    parentCategoryId: id,
                    runs: undefined
                };
            }
        }
    }
    return dataHolder;
}

export async function addRunsToBaseData(dataWithoutRunCount: GameDataFinalized): Promise<GameDataFinalized> {
    const unparsed_game_name = dataWithoutRunCount.gameData.name;
    const GAME_NAME = unparsed_game_name.replace(/\s/g, '').toLowerCase();

    const { categories, subcategories } = dataWithoutRunCount.categoryData;
    const categoryIDS = Object.keys(categories);
    for (let c = 0; c < categoryIDS.length; c++) {
        const categoryID = categoryIDS[c];
        const link = `https://www.speedrun.com/api/v1/leaderboards/${GAME_NAME}/category/${categoryID}`;

        const amountOfRunsInCategory = await fuckingbullshit(link, subcategories);
        categories[categoryID].runs = amountOfRunsInCategory;
    }
    return dataWithoutRunCount;
}

async function fuckingbullshit(link: string, subcategories: InnerSubCatDataStructure): Promise<number> {
    let counter = 0;
    const subCategoryIDS = Object.keys(subcategories);
    for (let i = 0; i < subCategoryIDS.length; i++) {
        const subcatID = subCategoryIDS[i];
        if (subcatID === 'variables') { continue; }
        try {
            const tempData = await getRunData(link, subcategories[subcatID]);
            subcategories[subcatID].runs = tempData;
            counter += subcategories[subcatID].runs.length;
        } catch (e) {
            console.error(e);
        }
    }
    return counter;
}


