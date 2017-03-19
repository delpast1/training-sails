module.exports = {
    schema: true,

    attributes: {
        kind: {
            type: 'string',
            required: true
        },

        user: {
            type: 'string'
        },

        event: {
            model: 'Event'
        },

        toJSON: function() {
            var obj = this.toObject();
            return obj;
        }
    }
};