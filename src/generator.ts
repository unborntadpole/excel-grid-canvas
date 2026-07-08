// import * as fs from 'fs';
// import * as path from 'path';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    salary: number;
}

function generateData(): User[] {

    const firstNames: string[] = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Elijah", "Sophia", "James", "Isabella", "William"];
    const lastNames: string[] = ["Adani", "Advani", "Agarwal", "Amarnath", "Amra", "Anand", "Arasaratnam", "Aron", "Badesha"];

    const rows: number = 50_000;
    const list: User[] = [];

    const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

    const getRandomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    for (let i = 0; i < rows; i++) {
        const row: User = {
            id: i + 1,
            firstName: getRandomElement(firstNames),
            lastName: getRandomElement(lastNames),
            age: getRandomInt(21, 35),
            salary: getRandomInt(700_000, 1_000_000)
        };
        list.push(row);
    }

    // const filePath = path.join('.', 'data.json');
    // const dirPath = path.dirname(filePath);

    // if (!fs.existsSync(dirPath)) {
    //     fs.mkdirSync(dirPath, { recursive: true });
    // }

    // fs.writeFileSync(filePath, JSON.stringify(list, null, 4), 'utf-8');
    // console.log(`Successfully generated ${rows} records in ${filePath}`);

    return list;
}
export { generateData };