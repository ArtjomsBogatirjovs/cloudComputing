const constants = {
    IN_IMAGE: '_in',
    OUT_IMAGE: '_out',
    APP_PORT: 3000,
    MONGODB_URL: 'mongodb://mongo:27017/',
    MINIO_BUCKET_NAME: 'cars',
    MINIO_ENDPOINT: 'minio', //  '127.0.0.1'
    RABBITMQ_URL: 'amqp://rabbitmq', //  'amqp://127.0.0.1:5672'
    RABBITMQ_QUEUE: 'QUEUE-NAME',
};

module.exports = constants;