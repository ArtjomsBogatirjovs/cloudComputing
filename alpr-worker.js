const constants = require('./constants');
const amqp = require('amqplib');
const axios = require('axios');
const driveController = require("./controllers/DriveInOutController");


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

                let plateNumber =  await getPlateNumber(imageName);

                if (plateNumber != null) {
                    await driveController.registerDrive(plateNumber.toString(), imageName.startsWith(constants.DRIVE_IN))
                } else {
                    console.log("Error in simulating plateNumber!");
                }

                console.log("Plate number: " + plateNumber);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error in worker:', error);
    }
}

async function getPlateNumber(imageName) {
    try {
        const endpoint = `http://openalpr_app:9999/recognize/${imageName}`;

        const response = await axios.get(endpoint);

        console.log('Response:', response.data);

        return response.data;

    } catch (error) {
        console.error('Error fetching the plate number:', error);
    }
}

module.exports = {startWorker};