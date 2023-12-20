const amqp = require("amqplib");

async function startWorker() {
    const rabbitMQConnectionURL = 'amqp://rabbitmq';
//const rabbitMQConnectionURL = 'amqp://127.0.0.1:5672';
    const rabbitMQQueue = 'QUEUE-NAME';

    try {
        const connection = await amqp.connect(rabbitMQConnectionURL);
        const channel = await connection.createChannel();
        await channel.assertQueue(rabbitMQQueue);

        console.log(`Worker listening for messages in queue ${rabbitMQQueue}`);

        await channel.consume(rabbitMQQueue, async (msg) => {
            if (msg !== null) {
                const imageName = msg.content.toString();
                console.log(`Received message with image name: ${imageName}`);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error in worker:', error);
    }
}

startWorker();