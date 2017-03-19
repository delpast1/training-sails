/**
 * EventController
 *
 * @description :: Server-side logic for managing Events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
//
    createEvent: (req, res) => {
        if (req.decoded.admin){
            var request = req.body;
            
            var workflow = new (require('events').EventEmitter)();

            workflow.on('validateParams', () => {
                var errors = [];
                if (!request.name){
                    errors.push('Event\'s name required');
                }
                if (!request.description){
                    errors.push('Event\'s description required');
                }
                if (!request.date){
                    errors.push('Event\'s time required');
                }
                if (!request.nA){
                    errors.push('Amount of A tickets required');
                }
                if (!request.nB){
                    errors.push('Amount of B tickets required');
                }
                workflow.emit('finishValidate', errors);
            });

            workflow.on('finishValidate', (errors)=>{
                if (errors.length){
                    res.json({ 
                        result: null,
                        error: errors
                    });
                } else {
                    workflow.emit('addEvent');
                }
            });

            workflow.on('addEvent', () => {
                Event.create(req.body).exec((err, event) => {
                    if (err) {
                        return res.json(err.status, {error: err});
                    }

                    if (event) {
                        res.json(200, {
                            Event: event, 
                            error: null
                        });
                    }
                });
            });

            workflow.emit('validateParams');
        } else res.json({message: 'You are not admin'});
    },
//
    listEvent: (req, res) => {
        Event.find({}).exec( (err, events) => {
            res.json({
                    result: events && !err ? events : null,
                    error: err ? err : null
                });
        });
    },
//
    deleteEvent: (req, res) => {
        if (req.decoded.admin){
            if (!req.body.id) return res.json({message: 'Id of event is required'});
            Event.destroy({id: req.body.id}).exec( (err) =>{
                if (err) {
                    return res.json(err.status, {error: err});
                }
                Ticket.destroy({event: req.body.id}).exec( (err) => {
                    if (err) {
                        return res.json(err.status, {error: err});
                    }
                });
                return res.json({message: 'delete successfully'});
            });
        } else res.json({message: 'You are not admin'});
    },

//
    purchaseTicket: (req, res) => {
        if (!req.decoded.admin){
            let infoTicket = {
                kind: req.body.kind,
                user: req.decoded.id,
                event: req.body.idEvent
            };
            Event.findOne({id: infoTicket.event}).exec( (err, event) => {
                if (infoTicket.kind === 'A' && event.nA <= 0){
                    return res.json({
                        message: 'Ticket A is out of stock'
                    });
                } else if (infoTicket.kind === 'B' && event.nB <= 0){
                    return res.json({
                        message: 'Ticket B is out of stock'
                    });
                } else if (infoTicket.kind !== 'A' && infoTicket.kind !== 'B'){
                    return res.json({
                        message: 'Ticket is not valid'
                    });
                } else {
                    if (infoTicket.kind === 'A'){
                        let nA = event.nA;
                        nA--;
                        Ticket.create(infoTicket).exec((err, ticket) => {
                            if (err) {
                                return res.json(err.status, {error: err});
                            };
                            if (ticket) {
                                Event.update({id: infoTicket.event}, {nA: nA}).exec( (err, updatedUser) => {
                                    if (err) return res.json(err.status, {error: err});
                                });

                                res.json(200, {
                                    ticket: ticket, 
                                    error: null
                                });
                            }
                        });
                    } else if (infoTicket.kind === 'B'){
                        let nB = event.nB;
                        nB--;
                        Ticket.create(infoTicket).exec((err, ticket) => {
                            if (err) {
                                return res.json(err.status, {error: err});
                            };
                            if (ticket) {
                                Event.update({id: infoTicket.event}, {nB: nB}).exec( (err, updatedUser) => {
                                    if (err) return res.json(err.status, {error: err});
                                });

                                res.json(200, {
                                    ticket: ticket, 
                                    error: null
                                });
                            }
                        });
                    }
                }
            });
        } else res.json({message: 'Admin cannot buy ticket'});
    },

    showDetail: (req, res) => {
        var idEvent = req.body.idEvent;
        var friendsJoin = [];
    
        Event.findOne({id: idEvent}).exec( (err, event) => {
            User.findOne({id: req.decoded.id}).exec( (err, user) => {
                var listFriends = user.friends;
                Ticket.find({event: idEvent}). exec( (err, tickets) => {
                    for(let i=0;i<listFriends.length;i++){
                        for(let j=0; i<tickets.length; j++){
                            if (tickets[j].user === listFriends[i]){
                                friendsJoin.push(listFriends[i]);
                                break;
                            }
                        }

                        if (i === listFriends.length-1) {
                            res.json({
                                Event_Name: event.name,
                                Event_Description: event.description,
                                Event_Date: event.date,
                                Friends_Bought: friendsJoin 
                            });
                        }
                    }
                });
            });
        });
    }
    /*
    deleteTicket: (req, res) => {
            if (!req.body.id) return res.json({message: 'Id of event is required'});
            Ticket.destroy({id: req.body.id}).exec( (err) =>{
                if (err) {
                    return res.json(err.status, {error: err});
                } else res.json({message: 'delete successfully'});
            });
    },

    listTicket: (req, res) => {
        Ticket.find({}).exec( (err, events) => {
            res.json({
                    result: events && !err ? events : null,
                    error: err ? err : null
                });
        });
    },*/
};

