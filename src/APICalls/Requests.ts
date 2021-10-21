import { APICategoryLeaderboardWrapper, APIGameResponse, RunnerDataWrapper } from "../Interfaces_And_Types/API_Types";
import axios from 'axios';

export async function apiGameRequest(url: string): Promise<APIGameResponse | undefined> {

    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data as APIGameResponse;
        }
    } catch (err) {
        throw new Error('HTTP-Error: ' + err);
    }
}

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