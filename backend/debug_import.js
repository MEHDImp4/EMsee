const validateRequest = require('./middlewares/validateRequest');
console.log('Type of validateRequest:', typeof validateRequest);
console.log('validateRequest:', validateRequest);

const { createPostSchema } = require('./validators/post.schema');
console.log('createPostSchema:', createPostSchema);
