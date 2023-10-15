const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const https = require('https');

const app = express();
const port = 3000;

const localPath = 'resources/cars.csv';

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    downloadDataInFile();
    getDataFromFile
    ();
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
    const data = [];

    fs.createReadStream(localPath)
        .pipe(csv())
        .on('data', (row) => {
            data.push({
                date: row.Datums,
                car: row.MarkaModelis,
                fuel: row.Degviela,
                type: row.Veids,
                rating: parseInt(row.Novertējums),
            });
        })
        .on('end', () => {
            console.log('CSV data loaded');
        });
    console.log(data);
    return data;
};

app.get('/getData/make/:make/engine/:engine', (req, res) => {
    const {make, engine} = req.params;

    const data = getDataFromFile();
    ();
    console.log(data);
    const results = data.filter((entry) => {
        return (
            entry.car.toLowerCase().includes(make.toLowerCase()) &&
            entry.fuel.toLowerCase().includes(engine.toLowerCase())
        );
    });

    res.json({results, count: results.length});
});

