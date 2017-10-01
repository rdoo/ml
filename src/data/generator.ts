import { createWriteStream, readFile } from 'fs';
import { Collection, MongoClient } from 'mongodb';

const MONGO_URL: string = process.env.MONGO_URL || '';

export function getStringDataFromMongo(ticker: string, date: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const resultArray: string[] = [];

        MongoClient.connect(MONGO_URL, (error, db) => {
            if (error) {
                console.error(error);
            } else {
                const collection: Collection = db.collection('wse');

                collection.findOne({ date }, (error, result) => {
                    if (error) {
                        console.error(error);
                        reject();
                    } else {
                        console.log('Result:');

                        if (!result.data) {
                            throw('No data');
                        }

                        for (const line of result.data) {
                            if (line.indexOf('T2,' + ticker) !== -1) {
                                resultArray.push(line);
                            }
                        }
                    }

                    db.close();
                    resolve(resultArray);
                });
            }
        });
    });
}

export function getStringDataFromFile(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        readFile('build/data.txt', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.split('\n'));
            }
        });
    });
}

export function saveDataToFile(array: string[]) {
    const writer = createWriteStream('datax.txt', { flags: 'a' });

    for (const line of array) {
        writer.write(line + '\n');
    }
}

export function transformData(array: string[]) {
    const data: any[] = [];
    const firstItemPrice: number = Number(array[0].split(',')[5]);

    for (const item of array) {
        const splitItem: string[] = item.split(',');
        const price: number = Number(splitItem[5]);
        const time: string = splitItem[2];

        if (time !== '090000' && time < '170000') {
            data.push({ value: (price - firstItemPrice) / firstItemPrice * 100 * 100, volume: Number(splitItem[6]), time });
        }
    }

    return data;
}