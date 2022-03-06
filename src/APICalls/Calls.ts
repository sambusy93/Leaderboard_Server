import { GameDataFinalized, RunnerDataFinalized, SubCatData, extraSortStructure, FullRunData, AllSortVariables, extraSortVariable } from "../Interfaces_And_Types/Cache_Interface";
import { handleGameData, handleGamesData, handlePlatformData, handleRunData, handleRunnerData } from "./Methods";
import { apiDeveloperRequest, apiGameRequest, apiGamesRequest, apiPlatformsRequest, apiRunnerRequest, apiRunsRequest } from "./Requests";
import { addRunsToBaseData, addRunCountToCategoryObjects, countUniqueRunners } from "./Helpers";
import { MultiGameItem, PlatformData } from "../Interfaces_And_Types/API_Types";

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

//Get first 50games in SRC
export async function getGamesData(): Promise<Record<string, MultiGameItem>> {
    const URL = `http://speedrun.com/api/v1/games?max=50`; //TODO: CHANGE TO DYNAMIC MAX AND PAGINATION
    const gamesData = await apiGamesRequest(URL);
    if (!gamesData) { return {} as Record<string, MultiGameItem>; }

    return handleGamesData(gamesData);
}

//Get Info on a Single Runner
export async function getRunnerData(URL: string): Promise<RunnerDataFinalized> {
    console.log(`processing ${URL}`);
    const runnerData = await apiRunnerRequest(URL);
    if (!runnerData) { return {} as RunnerDataFinalized; }

    return handleRunnerData(runnerData);
}


//Get Runs From a specific category
export async function getRunData(url: string, subCategoryOBJ: SubCatData, extraSortVariables?: extraSortStructure): Promise<FullRunData[]> {
    const temp = await apiRunsRequest(url);
    if (!temp || !temp.data.runs) { console.log('no temp data'); return []; }

    const returnedRuns = temp.data.runs;
    const runsFilteredToSubCat = returnedRuns.filter(runEntry => Object.values(runEntry.run.values).includes(subCategoryOBJ.id));

    if (extraSortVariables) { return handleRunData(runsFilteredToSubCat, subCategoryOBJ, extraSortVariables); }

    return handleRunData(runsFilteredToSubCat, subCategoryOBJ);
}

//Get Info on a Single Developer
export async function getDeveloperInfo(developerID: string): Promise<string> {
    const url = `http://speedrun.com/api/v1/developers/${developerID}`;
    const data = await apiDeveloperRequest(url);
    return data ? data.name : "Unknown Developer";
}

//Get Info on All Platforms
export async function getPlatformData(): Promise<PlatformData> {
    const url = 'http://speedrun.com/api/v1/platforms';
    const data = await apiPlatformsRequest(url);
    return data ? handlePlatformData(data) : {} as PlatformData;
}


