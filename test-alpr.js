const fs = require('fs');
const axios = require('axios');

async function ocr(IMAGE_PATH) {
    const SECRET_KEY = 'd247f3323320e271f3ca466c93a04f44ee815b2e';

    try {
        const imageBuffer = fs.readFileSync(IMAGE_PATH);
        const img_base64 = imageBuffer.toString('base64');

        const url = `https://api.openalpr.com/v3/recognize?secret_key=${SECRET_KEY}&recognize_vehicle=0&country=eu&return_image=0&topn=10&is_cropped=0`;
        const response = await axios.post(url, img_base64, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const plate = response.data.results[0].plate;
        return plate;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

// Example usage
const IMAGE_PATH = 'resources/h786poj.jpg';
ocr(IMAGE_PATH).then(plate => {
    if (plate) {
        console.log('Number Plate:', plate);
    } else {
        console.log('No number plate found.');
    }
});
