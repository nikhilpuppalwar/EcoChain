const axios = require('axios');
const FormData = require('form-data');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

const uploadFile = async (buffer, filename, mimetype) => {
    try {
        const formData = new FormData();
        formData.append('file', buffer, {
            filename: filename,
            contentType: mimetype,
        });

        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },
            }
        );

        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading file to Pinata:', error?.response?.data || error.message);
        throw new Error('IPFS upload failed');
    }
};

const uploadJSON = async (jsonObject, name) => {
    try {
        const data = JSON.stringify({
            pinataOptions: { cidVersion: 1 },
            pinataMetadata: { name },
            pinataContent: jsonObject,
        });

        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },
            }
        );

        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading JSON to Pinata:', error?.response?.data || error.message);
        throw new Error('IPFS metadata upload failed');
    }
};

module.exports = { uploadFile, uploadJSON };
