try {
    console.log('Require supertest...');
    require('supertest');
    console.log('Supertest loaded.');

    console.log('Require app...');
    require('./src/app');
    console.log('App loaded.');
} catch (error) {
    console.error('Error:', error);
}
