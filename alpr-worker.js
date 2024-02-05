const constants = require('./constants');
const amqp = require('amqplib');
const {exec} = require('child_process');
const axios = require('axios');
const fs = require('fs');
const driveController = require("./controllers/DriveInOutController");

const localImagePath = 'downloaded_image.jpg';

async function startWorker() {
    const rabbitMQConnectionURL = constants.RABBITMQ_URL;
    const rabbitMQQueue = constants.RABBITMQ_QUEUE;

    try {
        const connection = await amqp.connect(rabbitMQConnectionURL);
        const channel = await connection.createChannel();
        await channel.assertQueue(rabbitMQQueue);

        console.log(`Worker listening for messages in queue ${rabbitMQQueue}`);

        await channel.consume(rabbitMQQueue, async (msg) => {
            if (msg !== null) {
                const imageName = msg.content.toString();
                console.log(`Received message with image name: ${imageName}`);

                const minioEndpoint = 'http://app-car:3000/images/' + imageName;

                let plateNumber;
                if (imageName.startsWith(constants.DRIVE_IN)) {
                    plateNumber = await simulateCarImageReading(minioEndpoint);
                } else {
                    plateNumber = await getExistingPlateNumber();
                }

                if (plateNumber != null) {
                    await driveController.registerDrive(plateNumber.toString(), imageName.startsWith(constants.DRIVE_IN))
                } else {
                    console.log("Error in simulating plateNumber!");
                }

                console.log("Plate number: " + plateNumber);

                //const wgetCommand = `docker exec -i openalpr wget ${minioEndpoint} -O /path/to/downloaded/image.jpg`;

                /*exec(wgetCommand, (wgetError, wgetStdout, wgetStderr) => {
                    if (wgetError) {
                        console.error('Error downloading image with wget:', wgetError.message);
                        return;
                    }
                    console.log("success!!");


                    const dockerCommand = `docker exec -i openalpr alpr -c eu -p lv -j ${imageName}`;
                    exec(dockerCommand, function (error, stdout, stderr) {
                        console.log("Got info from alpr");
                        console.log(stdout.toString());
                        console.log("Parsing JSON");
                        let plateOutput = JSON.parse(stdout.toString());
                        console.log("Found number plate");
                        console.log(plateOutput.results[0].plate);
                    });

                });*/
                //await uploadImageToOpenALPR(bucketName, imageName);


                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error in worker:', error);
    }
}

async function getExistingPlateNumber() {
    const tempDriveIn = await driveController.findDriveIn();
    return tempDriveIn ? tempDriveIn.plateNumber : null;
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


async function simulateCarImageReading(imageUrl) {
    try {
        downloadImage(imageUrl, localImagePath)
            .then((message) => console.log(message))
            .catch((error) => console.error(error));

        const plateNumber = generateRandomPlateNumber();

        //place for image reading

        console.log(`Car image processed successfully. Plate Number: ${plateNumber}`);
        return plateNumber;
    } catch (error) {
        console.error(`Error simulating car image reading: ${error.message || error}`);
        throw error;
    }
}

function generateRandomPlateNumber() {
    const randomLetters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26));

    const randomNumbers = Math.floor(100 + Math.random() * 900);

    return `${randomLetters}${randomNumbers}`;
}

/*async function uploadImageToOpenALPR(bucketName, objectKey) {
    try {
        const downloadStream = await minioClient.getObject(bucketName, objectKey);

        const imageData = await new Promise((resolve, reject) => {
            const chunks = [];
            downloadStream.on('data', (chunk) => chunks.push(chunk));
            downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
            downloadStream.on('error', reject);
        });

        const response = await axios.post(openalprEndpoint, { image: imageData });

        // Process the OpenALPR response
        console.log('OpenALPR Response:', response.data);
    } catch (error) {
        console.error('Error uploading image to OpenALPR:', error.message);
    }
}*/

module.exports = {startWorker};