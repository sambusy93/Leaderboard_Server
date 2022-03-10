import { APICategoryLeaderboardWrapper, APIDeveloperData, APIMultiGameResponse, APIPlatformResponse, APISingleGameResponseWithCatData, DeveloperAPIResponse, RunnerDataWrapper } from "../Interfaces_And_Types/API_Types";
import axios from 'axios';

//Single Game Request
export async function apiGameRequest(url: string): Promise<APISingleGameResponseWithCatData | undefined> {

    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data as APISingleGameResponseWithCatData;
        }
    } catch (err) {
        throw new Error('The Game Request threw this HTTP-Error: ' + err);
    }
}

//Multi-Game Request
export async function apiGamesRequest(url: string): Promise<APIMultiGameResponse | undefined> {

    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data as APIMultiGameResponse;
        }
    } catch (err) {
        throw new Error('The Games Request threw this HTTP-Error: ' + err);
    }
}


//Request Runs from category, game, or runner
export async function apiRunsRequest(url: string): Promise<APICategoryLeaderboardWrapper | undefined> {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data as APICategoryLeaderboardWrapper;
        }
    } catch (err) {
        throw new Error('The Runs Request threw this HTTP-Error: ' + err);
    }
}

//Single Runner Request
export async function apiRunnerRequest(url: string): Promise<RunnerDataWrapper | undefined> {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data as RunnerDataWrapper;
        }
    } catch (err) {
        throw new Error('The Runner Request threw this HTTP-Error: ' + err);
    }
}

//Developer Info Request
export async function apiDeveloperRequest(url: string): Promise<APIDeveloperData | undefined> {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data as APIDeveloperData;
        }
    } catch (err) {
        throw new Error('The Developer Request threw this HTTP-Error: ' + err);
    }
}

//Get All Known Platforms
export async function apiPlatformsRequest(url: string): Promise<APIPlatformResponse | undefined> {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data as APIPlatformResponse;
        }
    } catch (err) {
        throw new Error('The Platforms Request threw this HTTP-Error: ' + err);
    }

}