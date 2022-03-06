import { APICategoryLeaderboardWrapper, APIMultiGameResponse, APISingleGameResponseWithCatData, RunnerDataWrapper } from "../Interfaces_And_Types/API_Types";
import axios from 'axios';

//Single Game Request
export async function apiGameRequest(url: string): Promise<APISingleGameResponseWithCatData | undefined> {

    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data as APISingleGameResponseWithCatData;
        }
    } catch (err) {
        throw new Error('HTTP-Error: ' + err);
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
        throw new Error('HTTP-Error: ' + err);
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
        throw new Error('HTTP-Error: ' + err);
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
        throw new Error('HTTP-Error: ' + err);
    }
}