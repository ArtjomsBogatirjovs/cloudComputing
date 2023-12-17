//APP
const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



//MINIO
const Minio = require('minio');
const bucketName = 'cars';
const minioClient = new Minio.Client({
    //endPoint: '127.0.0.1',
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
});



const amqp = require('amqplib');
const rabbitMQConnectionURL = 'amqp://rabbitmq';
const rabbitMQQueue = 'QUEUE-NAME';

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imageBuffer = req.file.buffer;
    const imageName = `${Date.now()}_${req.file.originalname}`;

    minioClient.putObject(bucketName, imageName, imageBuffer, async (err, etag) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error uploading file to Minio.     ' + err);
        }

        // Send to RabbitMQ
        try {
            const connection = await amqp.connect(rabbitMQConnectionURL,);
            const channel = await connection.createChannel();
            await channel.assertQueue(rabbitMQQueue);
            await channel.sendToQueue(rabbitMQQueue, Buffer.from(imageName));
            console.log(`Image name ${imageName} sent to RabbitMQ`);
            await channel.close();
            await connection.close();
        } catch (error) {
            console.error('Error sending message to RabbitMQ:', error);
            return res.status(500).send('Error sending message to RabbitMQ.');
        }

        /*amqp.connect(rabbitMQConnectionURL, function(error0, connection) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(function(error1, channel) {
                if (error1) {
                    throw error1;
                }
                channel.assertQueue(rabbitMQQueue, {
                    durable: true
                });
                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", rabbitMQQueue);
                channel.sendToQueue(rabbitMQQueue, Buffer.from(imageName));
            });
        });*/


        res.status(200).send('File uploaded successfully.');
    });
});


async function startWorker() {
    try {
        const connection = await amqp.connect(rabbitMQConnectionURL);
        const channel = await connection.createChannel();
        await channel.assertQueue(rabbitMQQueue);

        console.log(`Worker listening for messages in queue ${rabbitMQQueue}`);

        // Обработка сообщений из очереди
        await channel.consume(rabbitMQQueue, (msg) => {
            if (msg !== null) {
                const imageName = msg.content.toString();
                console.log(`Received message with image name: ${imageName}`);

                // В этом месте вы можете добавить логику для обработки изображения

                // Подтверждение получения сообщения
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error in worker:', error);
    }
}

startWorker();

app.get('/', (req, res) => {
    res.send('Hello, World! Artjoms Bogatirjovs 171RDB112 :)');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});