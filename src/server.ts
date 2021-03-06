/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request } from 'express';
import { ServerCache } from './Interfaces_And_Types/Cache_Interface';
import { getGameData, getGamesData, getPlatformData, getRunnerData } from './APICalls/Calls';
const app: any = express();

////////////////
///TYPES NEED DEFENITIONS
////////////////
//cAching 'all' runner id data to the server (look into LRU [libraries]);
//Robust cache of games' data mapped to each individual gameName/ID


//to dos
//break apiReqs out of client side
//remove client side api urls
//massage data serverside

//const GAME_URL = `http://speedrun.com/api/v1/games/${Game_Name}?embed=categories.variables`;
const CACHE: ServerCache = { Games: {}, Runners: {}, MultiGame: {}, Platforms: {} };

app.use((_req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


app.get('/game', async (req: Request, res: any): Promise<void> => {
    const Game_Name: string = req.query.gameID as string;
    console.log(`Incoming GET request to /game...  ${Game_Name}`);


    const GAME_URL = `http://speedrun.com/api/v1/games/${Game_Name}?embed=categories.variables`;
    console.log(`fetching game from ${GAME_URL}`);

    if (CACHE.Games[Game_Name] === undefined) {
        CACHE.Games[Game_Name] = await getGameData(GAME_URL);
        console.log(`${Game_Name} has been added to the cache`);
    }

    try {
        res.status(200).send(CACHE.Games[Game_Name]);
        console.log('GET request proccessed successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send();
        console.log('GET request failed');
    }
}
);

app.get('/games', async (req: Request, res: any): Promise<void> => {
    console.log(`Incoming GET request to /games...`);

    if (CACHE.MultiGame[1] === undefined) {
        console.log('MultiGame Cache is unfilled')
        CACHE.MultiGame = await getGamesData();
        console.log(`Cache.MultiGame has been added filled`);
    }

    try {
        res.status(200).send(CACHE.MultiGame);
        console.log('GET request proccessed successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send();
        console.log('GET request failed');
    }
}
);

app.get('/runner', async (req: string, res: any): Promise<void> => {
    let Runner_ID: string = res.req.query.runnerID;
    const Runner_URL: string = `https://www.speedrun.com/api/v1/users/${Runner_ID}`

    console.log(`Incoming GET request to /runner...  ${Runner_ID}`);

    if (CACHE.Runners[Runner_ID] === undefined) {
        CACHE.Runners[Runner_ID] = await getRunnerData(Runner_URL);
        console.log(`${Runner_ID} has been added to the cache`);
    }

    try {
        res.status(200).send(CACHE.Runners[Runner_ID]);
        console.log('Runner GET request proccessed successfully ' + Runner_ID);
    } catch (err) {
        console.log(err);
        res.status(500).send();
        console.log('Runner GET request failed' + Runner_ID);
    }
}
);

app.get('/platforms', async (req: string, res: any): Promise<void> => {
    CACHE.Platforms = await getPlatformData();
    try {
        res.status(200).send(CACHE.Platforms);
        console.log('Platform Data has been updated');
    } catch (err) {
        console.log(err);
        res.status(500).send();
        console.log('Platform Data update failed');
    }
});

console.log(`Express listening on ${4000}`);
app.listen(4000);

