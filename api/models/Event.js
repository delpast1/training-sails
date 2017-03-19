var noop = function(){};
module.exports = {
    schema: true,

    attributes: {
        id: {
            type: 'integer',
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: 'string',
            required: true
        },

        description: {
            type: 'string'
        },

        date: {
            type: 'date',
            required: true
        },

        tickets: {
            collection: 'Ticket',
            via: 'event'
        },
        //ticket A
        nA: {
            type: 'integer',
            required: true
        },
        //ticket B
        nB: {
            type: 'integer',
            required: true
        },

        toJSON: function() {
            var obj = this.toObject();
            return obj;
        }
    },

}