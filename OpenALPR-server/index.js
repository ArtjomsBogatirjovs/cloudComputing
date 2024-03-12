const express = require("express");
const fs = require("fs");
const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const app = express();
const port = 9999;

const localImagePath = 'downloaded_image.jpg';
app.get('/recognize/:imageName',  async (req, res) => {
    const minioEndpoint = 'http://app-car:3000/images/' + req.params.imageName;

    try {
        const plateNumber = await carImageReading(minioEndpoint);
        res.send(plateNumber);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Error processing the image: ${error.message || error}`);
    }
});

async function carImageReading(imageUrl) {
    try {
        await downloadImage(imageUrl, localImagePath);
        console.log('Image downloaded successfully');

        const { stdout } = await execAsync(`alpr -c eu -p lv -j ${localImagePath}`);
        console.log("Got info from alpr");
        console.log(stdout);

        const plateOutput = JSON.parse(stdout);
        if (plateOutput.results.length > 0) {
            console.log("Found number plate");
            console.log(plateOutput.results[0].plate);
            return plateOutput.results[0].plate;
        } else {
            throw new Error('No plate found');
        }
    } catch (error) {
        console.error(`Error car image reading: ${error.message || error}`);
        throw error;
    }
}


async function downloadImage(url, localPath) {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
        });

        response.data.pipe(fs.createWriteStream(localPath));

        return new Promise((resolve, reject) => {
            response.data.on('end', () => {
                resolve('Image downloaded successfully.');
            });

            response.data.on('error', (error) => {
                reject(`Error downloading image: ${error.message || error}`);
            });
        });
    } catch (error) {
        throw new Error(`Error downloading image: ${error.message || error}`);
    }
}
app.get('/', (req, res) => {
    res.send('Hello, World! Artjoms Bogatirjovs 171RDB112 :)');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
