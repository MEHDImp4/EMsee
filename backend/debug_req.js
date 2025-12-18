try {
    console.log('Requiring post.helpers...');
    const helpers = require('./src/controllers/helpers/post.helpers');
    console.log('Helpers loaded:', Object.keys(helpers));

    console.log('Requiring notification.controller...');
    const ctrl = require('./src/controllers/notification.controller');
    console.log('Controller loaded:', Object.keys(ctrl));
    console.log('Requiring authMiddleware...');
    const auth = require('./src/middlewares/authMiddleware');
    console.log('Auth loaded:', typeof auth);

    console.log('Requiring notification.routes...');
    const routes = require('./src/routes/notification.routes');
    console.log('Routes loaded');
} catch (error) {
    console.error('Error during require:', error);
}
