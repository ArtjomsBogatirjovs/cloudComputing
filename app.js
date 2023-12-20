//APP
const constants = require('./constants');
const express = require('express');
const app = express();
const port = constants.APP_PORT;

const MongoClient = require('mongodb').MongoClient;
const mongodbUrl = constants.MONGODB_URL;
const dbName = 'user';

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

//MINIO
const Minio = require('minio');
const bucketName = constants.MINIO_BUCKET_NAME;
const minioClient = new Minio.Client({
    endPoint: constants.MINIO_ENDPOINT,
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
});

const amqp = require('amqplib');
const rabbitMQConnectionURL = constants.RABBITMQ_URL;
const rabbitMQQueue = constants.RABBITMQ_QUEUE;

function uploadToMinio(imageName, imageBuffer, res) {
    minioClient.putObject(bucketName, imageName, imageBuffer, async (err, etag) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error uploading file to Minio.     ' + err);
        }

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
}

app.post('/upload/in', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imageBuffer = req.file.buffer;
    const imageName = `${Date.now()}_${req.file.originalname}${constants.IN_IMAGE}`;

    uploadToMinio(imageName, imageBuffer, res);
});

app.post('/upload/out', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imageBuffer = req.file.buffer;
    const imageName = `${Date.now()}_${req.file.originalname}${constants.OUT_IMAGE}`;

    uploadToMinio(imageName, imageBuffer, res);
});

app.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;

    // Set the response content type based on your image type
    const contentType = 'image/jpeg'; // Adjust accordingly

    // Retrieve the image from MinIO
    minioClient.getObject(bucketName, filename, (err, dataStream) => {
        if (err) {
            console.error('Error retrieving image from MinIO:', err);
            return res.status(500).json({error: 'Failed to retrieve image from MinIO'});
        }

        res.setHeader('Content-Type', contentType);
        dataStream.pipe(res);
    });
});

app.post('/user', async (req, res) => {
    try {
        const { email, name, plateNumber } = req.body;

        if (!email || !name || !plateNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create a new user
        await MongoClient.connect(mongodbUrl, function (err, db) {
            if (err) throw err;
            const dbo = dbo.db(dbName);
            dbo.collection("data").insertOne(req.body, function (err, result) {
                dbo.close();
                res.status(200).send({
                    message: "Document inserted",
                    data: result
                });
            });
        });

        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello, World! Artjoms Bogatirjovs 171RDB112 :)');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

if (require.main === module) {
    const {startWorker} = require('./alpr-worker');
    startWorker();
}