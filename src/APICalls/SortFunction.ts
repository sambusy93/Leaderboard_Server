// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RunComparator = (a: any, b: any) => number;//IF YOU CAN FIX THESE TYPES, BLESSINGS SHALL FLOW FROM THOUST CUP
//type SoftComparator = (a: SoftRunData, b: SoftRunData) => number; //i dont like this. this is bodge
type Comparable = number | string | null;

export function rankerFunc(unrankedArray: FullRunData[]): FullRunData[] {
    if (unrankedArray.length < 1) { return [] as FullRunData[] };
    const timeToSortBy = unrankedArray[0].runner.sortVariables.timewithoutloads != 0 ? SortableHeader.TIMEWITHOUTLOADS : SortableHeader.TIMEWITHLOADS;

    unrankedArray.sort(getComparator(timeToSortBy, true));

    return unrankedArray.map((entry: FullRunData, index: number) => {
        const rank = (index + 1);
        return { ...entry, rank: rank };
    });
}

function compare(a: Comparable, b: Comparable): number {
    if (a === null) {
        return 1;
    }
    if (b === null) {
        return -1;
    }
    if (a > b) { return 1; }
    if (a < b) { return -1; }
    else { return 0; }
}

export function getComparator(sorter: SortableHeader, shouldAscend: boolean): RunComparator | undefined {
    switch (sorter) {
        case 'runner':
            return (a: FullRunData, b: FullRunData): number => {
                return shouldAscend ? compare(a.runner.id, b.runner.id) : compare(b.runner.id, a.runner.id);
            };
        case 'rank':
            return (a: FullRunData, b: FullRunData): number => {
                return shouldAscend ? compare(a.rank, b.rank) : compare(b.rank, a.rank);
            };
        case 'time without loads':
            return (a: FullRunData, b: FullRunData): number => {
                return shouldAscend ? compare(a.runner.sortVariables.noloadTime, b.runner.sortVariables.noloadTime) : compare(b.runner.sortVariables.noloadTime, a.runner.sortVariables.noloadTime);
            };
        case 'time with loads':
            return (a: FullRunData, b: FullRunData): number => {
                return shouldAscend ? compare(a.runner.sortVariables.loadTime, b.runner.sortVariables.loadTime) : compare(b.runner.sortVariables.loadTime, a.runner.sortVariables.loadTime);
            };
        case 'platform':
            return (a: FullRunData, b: FullRunData): number => {
                return shouldAscend ? compare(a.runner.sortVariables.platform, b.runner.sortVariables.platform) : compare(b.runner.sortVariables.platform, a.runner.sortVariables.platform);
            };
        case 'date':
            return (a: FullRunData, b: FullRunData): number => {
                return shouldAscend ? compare(a.runner.sortVariables.date, b.runner.sortVariables.date) : compare(b.runner.sortVariables.date, a.runner.sortVariables.date);
            };
        case 'softdate':
            return (a: SoftRunData, b: SoftRunData): number => {
                return shouldAscend ? compare(a.date, b.date) : compare(b.date, a.date);
            };
        default:
            return;
    }
}

interface FullRunData {
    rank: number;
    runner: {
        id: string;
        uri: string;
        values: Record<string, string>;
        sortVariables: AllSortVariables;
    }
    ids: {
        category: string;
        subcategory: string;
        platform: string;
    }
}

interface SortVariables {
    timewithloads: number,
    timewithoutloads: number,
    platform: string,
    category: string,
    subcategory: string,
    date: string,
    patch?: string
}

interface SoftRunData {
    runner: string;
    rank: string;
    category: string;
    date: string;
}

enum SortableHeader {
    RANK = 'rank',
    RUNNER = 'runner',
    TIMEWITHOUTLOADS = 'time without loads',
    TIMEWITHLOADS = 'time with loads',
    PLATFORM = 'platform',
    PATCH = 'patch',
    DATE = 'date',
    SOFT_DATE = 'softdate',
    CATEGORY = 'category',
    SUBCATEGORY = 'subcategory'
}

interface ExtraSortVariableEntries {
    [key: string]: string | number;
}

type AllSortVariables = SortVariables & ExtraSortVariableEntries;