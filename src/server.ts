/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request } from 'express';
import { ServerCache } from './Interfaces_And_Types/Cache_Interface';
import { getGameData, getRunnerData } from './APICalls/Calls';
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
const CACHE: ServerCache = { Games: {}, Runners: {} };

app.use((_req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, runneruri');
    next();
});


app.get('/game', async (req: Request, res: any): Promise<void> => {
    const Game_Name: string = req.query.gameID as string;
    console.log(`Incoming GET request to /game...  ${Game_Name}`);


    const GAME_URL = `http://speedrun.com/api/v1/games/${Game_Name}?embed=categories.variables`;

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

app.get('/runner', async (req: string, res: any): Promise<void> => {
    let Runner_ID: string = res.req.query.runnerID;
    const Runner_URL: string = res.req.headers.runneruri;
    console.log(res.req.headers.runneruri);

    console.log(`Incoming GET request to /runner...  ${Runner_ID}`);

    if (Runner_ID === undefined) {
        const data = await getRunnerData(Runner_URL);
        Runner_ID = data.name;
        CACHE.Runners[Runner_ID] = data;
    }

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

console.log(`Express listening on ${4000}`);
app.listen(4000);

