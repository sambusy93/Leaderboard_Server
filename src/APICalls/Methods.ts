import { APIGameResponse, APICategoryData, APIRunData, RunnerDataWrapper } from '../Interfaces_And_Types/API_Types';
import { AllSortVariables, CategoryDataFinalized, CategoryDataStructure, extraSortStructure, extraSortVariable, FullRunData, GameDataFinalized, InnerSubCatDataStructure, RunnerDataFinalized, SubCatData } from '../Interfaces_And_Types/Cache_Interface';
import { findDefaultCategory, unwrapSubCats } from './Helpers';
import { rankerFunc } from './SortFunction';
import platformData from '../FixedDataThatShouldntBeHereLong/platforms.json'

export async function handleGameData(someData: APIGameResponse): Promise<GameDataFinalized> {
    //handle single-level or broken links
    if (!someData.data) { console.log('someData.data in handleGameData() failed '); return {} as GameDataFinalized; }

    //call the handleData function first so we can access some of their info 
    const categoryData = await handleCatData(someData.data.categories.data);
    const defaultCatInfo = await findDefaultCategory(categoryData);

    const outputData = {
        gameData: {
            name: someData.data.names.twitch,
            abbreviation: someData.data.abbreviation,
            id: someData.data.id,
            releaseDate: someData.data['release-date'],
            numberOfCategories: Object.keys(categoryData.categories).length,
            numberOfSubCategories: Object.keys(categoryData.subcategories).length,
            defaultCategoryInfo: defaultCatInfo,
            assets: someData.data.assets
        },
        categoryData,
    };

    return outputData;
}

async function handleCatData(catData: APICategoryData[]): Promise<CategoryDataFinalized> {
    const outputData = { subcategories: {} } as CategoryDataFinalized;
    const categories: CategoryDataStructure = {};
    const subCatsHolder = [];

    for (const category in catData) {
        const { name, id } = catData[category];
        //ADD CHECK FOR SINGLE LEVEL SUBCATEGORIES HERE.
        const finishedSubCatInfo = handleSubCatData(catData[category]);// {{subCatID: {SUBCATINFO}, ...}, {...}}
        if (finishedSubCatInfo.isSingleLevel) { continue; }
        const subCatKeys = Object.keys(finishedSubCatInfo);

        const firstEntry = subCatKeys[0] ? subCatKeys[0] : undefined;

        categories[id] = {
            name,
            id,
            runs: undefined,
            defaultSubCatID: firstEntry ? finishedSubCatInfo[firstEntry].id : null,
            defaultSubCatName: firstEntry ? finishedSubCatInfo[firstEntry].name : null,
            extraSortVariables: firstEntry ? finishedSubCatInfo[firstEntry].extraSortVariables : null,
            subCategories: finishedSubCatInfo
        };

        subCatsHolder.push(finishedSubCatInfo);
    }

    outputData.subcategories = unwrapSubCats(subCatsHolder);
    outputData.categories = categories;

    return outputData;
}

function handleSubCatData(categoryData: APICategoryData): Record<string, SubCatData> {
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
        }
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
                    extraSortVariables: extraSortVariables ? extraSortVariables : undefined,
                    isSingleLevel: entry.scope.type === 'single-level' ? true : false,
                    runs: undefined
                };
            }
        }
    }
    return dataHolder;
}

export async function handleRunnerData(runnerData: RunnerDataWrapper): Promise<RunnerDataFinalized> {
    //declare empty output
    const output = {} as RunnerDataFinalized;
    //extract variables that are always present
    const { data } = runnerData;
    const { id, names } = data;
    //set output fields to known values
    output.id = id;
    output.name = names.international;

    //check if user has gradient name styling and set output fields accordingly
    if (data['name-style']['color-from'].light) {
        const lightStyle = {
            'font-size': '2rem',
            'margin-bottom': '4%',
            background: `linear-gradient(${data['name-style']['color-from'].light}, ${data['name-style']['color-to'].light})`,
            'background-clip': 'text',
            '-webkit-background-clip': 'text',
            '-moz-background-clip': 'text',
            '-moz-text-fill-color': 'transparent',
            '-webkit-text-fill-color': 'transparent',
            'background-size': '100%'
        };
        output.styleLight = lightStyle;
    }
    if (data['name-style']['color-from'].dark) {
        const darkStyle = {
            'font-size': '2rem',
            'margin-bottom': '4%',
            'background': `linear-gradient(${data['name-style']['color-from'].dark}, ${data['name-style']['color-to'].dark})`,
            'background-clip': 'text',
            '-webkit-background-clip': 'text',
            '-moz-background-clip': 'text',
            '-moz-text-fill-color': 'transparent',
            '-webkit-text-fill-color': 'transparent',
            'background-size': '100%'
        };
        output.styleDark = darkStyle;
    }
    return output;
}

export function handleRunData(runsInSubCategory: APIRunData[], subCatOBJ: SubCatData, extraSortVariables?: extraSortStructure): FullRunData[] {
    const OutputArray = [] as FullRunData[];

    if (runsInSubCategory.length < 1) { return OutputArray };

    const platforms: Record<string, string> = platformData;

    runsInSubCategory.forEach(runEntry => {
        const { run } = runEntry;
        if (run.status.status !== 'verified') { return; }

        const { values } = run;
        const sortVariables: AllSortVariables = {
            timewithoutloads: run.times.realtime_noloads_t,
            timewithloads: run.times.realtime_t,
            platform: platforms[run.system.platform],
            category: subCatOBJ.parentCategoryName,
            subcategory: subCatOBJ.name,
            date: run.date
        };

        if (extraSortVariables && extraSortVariables.name) {
            const variableOBJs: extraSortVariable[] = Object.values(extraSortVariables);
            const runnervariableIDS = Object.keys(values);
            for (let i = 0; i < runnervariableIDS.length; i++) {
                const runnerVariableNameID = runnervariableIDS[i];
                const runnerVariableValueID = values[runnerVariableNameID];
                const singleVariable = variableOBJs.find(variable => variable.id = runnerVariableNameID);
                if (!singleVariable) { continue; }

                sortVariables[singleVariable.name] = singleVariable.choices[runnerVariableValueID];
            }
        }

        OutputArray.push({
            rank: runEntry.place,
            runner: {
                id: run.players[0].id,
                uri: decodeURI(run.players[0].uri),
                values,
                sortVariables
            },
            ids: {
                category: run.category,
                subcategory: subCatOBJ.id,
                platform: run.system.platform
            }
        });
    });

    const rankedOutput = rankerFunc(OutputArray);
    return rankedOutput;
}


