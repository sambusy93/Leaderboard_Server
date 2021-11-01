import { GameDataFinalized, RunnerDataFinalized, SubCatData, extraSortStructure, FullRunData, AllSortVariables, extraSortVariable } from "../Interfaces_And_Types/Cache_Interface";
import { handleGameData, handleGamesData, handleRunData, handleRunnerData } from "./Methods";
import { apiGameRequest, apiGamesRequest, apiRunnerRequest, apiRunsRequest } from "./Requests";
import { addRunsToBaseData, addRunCountToCategoryObjects, countUniqueRunners } from "./Helpers";
import { MultiGameItem } from "../Interfaces_And_Types/API_Types";

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

export async function getGamesData(): Promise<MultiGameItem[]> {
    const URL = `http://speedrun.com/api/v1/games?max=50`; //TODO: CHANGE TO DYNAMIC MAX AND PAGINATION
    const gamesData = await apiGamesRequest(URL);
    if (!gamesData) { return [] as MultiGameItem[]; }

    return handleGamesData(gamesData);
}

export async function getRunnerData(URL: string): Promise<RunnerDataFinalized> {
    console.log(`processing ${URL}`);
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



