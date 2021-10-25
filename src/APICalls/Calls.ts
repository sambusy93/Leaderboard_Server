import { RunnerDataWrapper, APIRunData } from "../Interfaces_And_Types/API_Types";
import { GameDataFinalized, RunnerDataFinalized, SubCatData, extraSortStructure, FullRunData, AllSortVariables, extraSortVariable } from "../Interfaces_And_Types/Cache_Interface";
import { handleGameData, addRunsToBaseData, addRunCountToCategoryObjects, countUniqueRunners } from "./Methods";
import { apiGameRequest, apiRunnerRequest, apiRunsRequest } from "./Requests";
import platformData from '../FixedDataThatShouldntBeHereLong/platforms.json'
import { getComparator, rankerFunc } from "./SortFunction";

export async function getGameData(URL: string): Promise<GameDataFinalized> {
    //get the raw SRC data
    const gameData = await apiGameRequest(URL);

    //if we get data, send it to handleGameData, else abort and return empty {}
    const dataWithoutRunCount = gameData ? await handleGameData(gameData) : {} as GameDataFinalized;
    const dataAfterAddRuns = await addRunsToBaseData(dataWithoutRunCount);

    //then add the number of runs within each category to categoryData
    const dataWithRuns = addRunCountToCategoryObjects(dataAfterAddRuns);

    //add the number of unique runners to gameData
    dataWithRuns.gameData.uniqueRunners = countUniqueRunners(dataWithRuns);

    return dataWithRuns;
}

export async function getRunnerData(URL: string): Promise<RunnerDataFinalized> {
    const runnerData = await apiRunnerRequest(URL);
    if (!runnerData) { return {} as RunnerDataFinalized; }

    return handleRunnerData(runnerData);
}

export async function getRunData(url: string, subCategoryOBJ: SubCatData, extraSortVariables?: extraSortStructure): Promise<FullRunData[]> {
    const temp = await apiRunsRequest(url);
    if (!temp || !temp.data.runs) { console.log('no temp data'); return []; }

    const returnedRuns = temp.data.runs;
    const runsFilteredToSubCat = returnedRuns.filter(runEntry => Object.values(runEntry.run.values).includes(subCategoryOBJ.id));

    if (extraSortVariables) { return handleRunData(runsFilteredToSubCat, subCategoryOBJ, extraSortVariables); }

    return handleRunData(runsFilteredToSubCat, subCategoryOBJ);
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
                uri: run.players[0].uri,
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

