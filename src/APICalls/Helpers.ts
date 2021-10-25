import { CategoryDataFinalized, GameDataFinalized, InnerSubCatDataStructure, SubCatData } from "../Interfaces_And_Types/Cache_Interface";
import { getRunData } from "./Calls";


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



export async function findDefaultCategory(categoryData: CategoryDataFinalized, sorter?: string): Promise<Record<string, string>> {
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
    const output = {
        parentName: categoryData.categories[parentCategoryId].name,
        parentID: categoryData.categories[parentCategoryId].id,
        subcatName: topSubCategory.name,
        subcatID: topSubCategory.id,
        combo: `${categoryData.categories[parentCategoryId].name} - ${topSubCategory.name}`
    };

    return output;
}

export async function addRunsToBaseData(dataWithoutRunCount: GameDataFinalized): Promise<GameDataFinalized> {
    const GAME_NAME = dataWithoutRunCount.gameData.abbreviation;

    const { categories } = dataWithoutRunCount.categoryData;
    const categoryIDS = Object.keys(categories);
    for (let c = 0; c < categoryIDS.length; c++) {
        const categoryID = categoryIDS[c];
        const { subCategories } = categories[categoryID];
        const link = `https://www.speedrun.com/api/v1/leaderboards/${GAME_NAME}/category/${categoryID}`;

        const amountOfRunsInCategory = await addUpRunsInCategory(link, subCategories);
        categories[categoryID].runs = amountOfRunsInCategory;
    }
    return dataWithoutRunCount;
}

async function addUpRunsInCategory(link: string, subcategories: InnerSubCatDataStructure): Promise<number> {
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

export function unwrapSubCats(arrayOfSubCatInfo: Record<string, SubCatData>[]): InnerSubCatDataStructure {
    const output: Record<string, SubCatData> = {};

    for (let i = 0; i < arrayOfSubCatInfo.length; i++) { //each entry in the array can contain multiple subcategories
        const entry = arrayOfSubCatInfo[i];
        const subCategoryIDS = Object.keys(entry);
        const subCategoryData = Object.values(entry)

        for (let c = 0; c < subCategoryIDS.length; c++) { //push each subcategory to output
            output[subCategoryIDS[c]] = subCategoryData[c]
        }

    }
    return output;
}