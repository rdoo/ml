import { createWriteStream, readdir, readFile } from 'fs';
import { Collection, MongoClient } from 'mongodb';

const MONGO_URL: string = process.env.MONGO_URL || '';

export function getAllDataFromMongoSince(startDate: string) {
    MongoClient.connect(MONGO_URL, (error, db) => {
        if (error) {
            console.error(error);
        } else {
            const collection: Collection = db.collection('wse');

            collection.find({ date : { $gte: startDate } }).toArray((error, result) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log('Result:');
                    console.log(result);

                    if (!result.length || result.length === 0) {
                        throw('No data');
                    }

                    for (const item of result) {
                        saveDataToFile('src/data/dump/' + item.date + '.txt', item.data);
                    }
                }
                db.close();
            });
        }
    });
}

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

export function readFilenamesInDirectory(directory: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        readdir(directory, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export function chooseDataOfStock(data: string[], ticker: string) {
    const resultArray: string[] = [];

    for (const line of data) {
        if (line.indexOf('T2,' + ticker) !== -1) {
            resultArray.push(line);
        }
    }

    return resultArray;
}

export function getStringDataFromFile(filename: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        readFile(filename, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.split('\n'));
            }
        });
    });
}

export function saveDataToFile(filename: string, array: string[]) {
    const writer = createWriteStream(filename, { flags: 'a' });

    for (const line of array) {
        writer.write(line + '\n');
    }
}

export function transformData(array: string[]) {
    const data: any[] = [];
    const firstItemPrice: number = Number(array[0].split(',')[5]);
    const firstItemTime: string = array[0].split(',')[2];
    const lastItemTime: string = array[array.length - 1].split(',')[2];

    if (firstItemTime !== '090000' || lastItemTime < '170000') {
        return data;
    }

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