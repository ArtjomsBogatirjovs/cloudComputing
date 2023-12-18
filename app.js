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
//const rabbitMQConnectionURL = 'amqp://127.0.0.1:5672';
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

        res.status(200).send('File uploaded successfully.');
    });
});


app.get('/', (req, res) => {
    res.send('Hello, World! Artjoms Bogatirjovs 171RDB112 :)');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

if (require.main === module) {
    const { startWorker } = require('./alpr-worker');
    startWorker();
}