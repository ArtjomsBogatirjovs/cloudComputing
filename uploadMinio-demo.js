const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
});

minioClient.makeBucket('cars', function (err) {
    if (err) return console.log(err)
    console.log('Bucket created successfully')
// Using fPutObject API upload your file to the bucket europetrip.
    minioClient.fPutObject('cars', 'my-car.jpg', './resources/h786poj.jpg', function (err, etag) {
        if (err) return console.log(err)
        console.log('File uploaded successfully.')
    });
});
