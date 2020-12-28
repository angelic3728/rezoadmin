import axios from 'axios';

const baseURL = 'http://localhost:5001/meditation-app-34538/us-central1/app/';
const serverBaseUrl = 'https://us-central1-meditation-app-34538.cloudfunctions.net/app';


const instance = axios.create({
    baseURL: process.env.NODE_ENV.toLowerCase() === 'production' ? serverBaseUrl : baseURL
});


export default instance;