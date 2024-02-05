const axios = require('axios');

async function fetchData() {
    const encodedParams = new URLSearchParams();
    encodedParams.set('image_url', 'http://plates.openalpr.com/h786poj.jpg');

    const options = {
        method: 'POST',
        url: 'https://openalpr.p.rapidapi.com/recognize_url',
        params: {
            country: 'eu'
        },
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': '5fb1905f5amsh00467b3ecc4076ap17fc8ajsnfb156c12baa8',
            'X-RapidAPI-Host': 'openalpr.p.rapidapi.com'
        },
        data: encodedParams,
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

fetchData();