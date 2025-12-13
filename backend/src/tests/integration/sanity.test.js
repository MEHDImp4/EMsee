const validateRequest = require('../../middlewares/validateRequest');

describe('Sanity Check', () => {
    it('validateRequest should be a function', () => {
        console.log('validateRequest type:', typeof validateRequest);
        expect(typeof validateRequest).toBe('function');
    });
});
