const express = require('express');
const {parse} = require("csv-parse"); //https://www.scaler.com/topics/read-csv-javascript/
const fs = require('fs');
const https = require('https');

const app = express();
const port = 3000;

const localPath = 'resources/cars.csv';

const charMap = {
    'ā': 'a',
    'ē': 'e',
    'ļ': 'l',
    'ğ': 'g',
    'ķ': 'k',
    'š': 's',
    'ž': 'z',
    'ī': 'i'
};

function replaceChar(match) {
    return charMap[match] || match;
}

app.listen(port, () => {
    downloadDataInFile();
});

const downloadDataInFile = () => {

    if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
    }

    const fileUrl = 'https://data.gov.lv/dati/dataset/e823f5b6-4403-491d-8fd2-161cf65c11f4/resource/f2579b7a-a752-43b7-8d7a-6924daac5e09/download/ta2017c.lst';
    const file = fs.createWriteStream(localPath);

    const request = https.get(fileUrl, (response) => {
        response.pipe(file);
    });

    request.on('error', (error) => {
        console.error(`Error downloading the CSV file: ${error}`);
    });
};


const getDataFromFile = () => {
    return new Promise((resolve, reject) => {
        const data = [];

        fs.createReadStream(localPath)
            .pipe(
                parse({
                    delimiter: ";",
                    columns: true,
                    ltrim: true,
                    skip_records_with_error: true,
                })
            )
            .on("data", (row) => {
                data.push(row);
            })
            .on("error", function (error) {
                console.log(error.message);
            })
            .on('end', () => {
                console.log('CSV data loaded');
                resolve(data);
            });
    });
};
app.get('/getData/make/:make/engine/:engine', (req, res) => {
    const {make, engine} = req.params;

    const regex = new RegExp(/[ā-ž]/gi);
    let tempEngine = engine.toLowerCase().replace(regex, replaceChar);
    let tempMake = make.toLowerCase().replace(regex, replaceChar);

    getDataFromFile()
        .then((data) => {
            const results = data.filter((entry) => {
                let entryMarkModel = entry.MarkaModelis.toLowerCase().replace(regex, replaceChar);
                let entryEngine = entry.Degviela.toLowerCase().replace(regex, replaceChar);
                return (
                    entryMarkModel.includes(tempMake) && entryEngine.includes(tempEngine)
                );
            });
            res.json({results, count: results.length});
        })
        .catch((error) => {
            console.error('Error', error);
        });
});

