import { Collection, MongoClient } from 'mongodb';

const MONGO_URL: string = '';

const date: string = '2017-09-08';
const ticker: string = 'PZU';

const resultArray: string[] = [];

MongoClient.connect(MONGO_URL, (error, db) => {
    if (error) {
        console.error(error);
    } else {
        const collection: Collection = db.collection('wse');

        collection.findOne({ date }, (error, result) => {
            if (error) {
                console.error(error);
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
                console.log(resultArray);
            }
            db.close();
        });
    }
});