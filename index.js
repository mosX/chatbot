'use strict';
//thanks @voronianski and https://github.com/voronianski/simon-le-bottle


// Getting started with Facebook Messaging Platform
// https://developers.facebook.com/docs/messenger-platform/quickstart

var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');

var pageToken = 'EAAHREa60MN0BAOJ82ZAVlcoK0VMbX8bPow4g1nndsJGG7nMrBrzt1hjUv17Jam3xHHXbBW9XNUjWt90hiMK4aq2LWFZBNZB6BneZBjYRHoid36ZBoh2qzPf3FL8sqlCUDI0OGMWZBUjDjnt1ONO2ITQZBnxpCj21EpAg3G8QYnwZCAZDZD';
var verifyToken = 'chatbot';

var app = express();


app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


app.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === verifyToken) {
        return res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

app.post('/webhook', function(req, res) {
    var messagingEvents = req.body.entry[0].messaging;

    messagingEvents.forEach(function(event) {
        var sender = event.sender.id;

        if (event.postback) {
            var text = JSON.stringify(event.postback).substring(0, 200);
            sendTextMessage(sender, 'Postback received: ' + text);
        } else if (event.message && event.message.text) {
            var text = event.message.text.trim().substring(0, 200);

            if (text.toLowerCase() === 'generic') {
                sendGenericMessage(sender);
            }else if (text.toLowerCase() === 'image') {
                sendImageMessage(sender);
            }else if (text.toLowerCase() === 'audio') {
                sendAudioMessage(sender);
            }else if (text.toLowerCase() === 'video') {
                sendVideoMessage(sender);
            }else if (text.toLowerCase() === 'file') {
                //sendFileoMessage(sender);
            }else if (text.toLowerCase() === 'typingon') {
                sendTypingOnMessage(sender);
            }else if (text.toLowerCase() === 'typingoff') {
                sendTypingOffMessage(sender);
            }else if (text.toLowerCase() === 'button') {
                sendButtonMessage(sender);
            }else if (text.toLowerCase() === 'receipt') {
                sendReceiptMessage(sender);
            }else if (text.toLowerCase() === 'quickanswers') {
                sendQuickAnswersMessage(sender);
            } else {
                sendTextMessage(sender, 'Text received, echo: ' + text);
            }
        }
    });

    res.sendStatus(200);
});

function sendMessage (sender, message) {
    request
        .post('https://graph.facebook.com/v2.6/me/messages')
        .query({access_token: pageToken})
        .send({
            recipient: {
                id: sender
            },
            message: message
        })
        .end(function (err, res) {
            if (err) {
                console.log('Error sending message: ', err);
            } else if (res.body.error) {
                console.log('Error: ', res.body.error);
            }
        });
}

function sendQuickAnswersMessage(sender){
     sendMessage(sender, {
        text:"Pick a color:",
        quick_replies:[
          {
            content_type:"text",
            title:"Red",
            payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
          },
          {
            content_type:"text",
            title:"Green",
            payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
          }
        ]
    }); 
    
}

function sendReceiptMessage(sender){
    
     sendMessage(sender, {
        attachment:{
          type:"template",
          payload:{
            template_type:"receipt",
            recipient_name:"Stephane Crozatier",
            order_number:"12345678902",
            currency:"USD",
            payment_method:"Visa 2345",        
            order_url:"http://petersapparel.parseapp.com/order?order_id=123456",
            timestamp:"1428444852", 
            elements:[
              {
                title:"Classic White T-Shirt",
                subtitle:"100% Soft and Luxurious Cotton",
                quantity:2,
                price:50,
                currency:"USD",
                image_url:"http://petersapparel.parseapp.com/img/whiteshirt.png"
              },
              {
                "title":"Classic Gray T-Shirt",
                "subtitle":"100% Soft and Luxurious Cotton",
                "quantity":1,
                "price":25,
                "currency":"USD",
                "image_url":"http://petersapparel.parseapp.com/img/grayshirt.png"
              }
            ],
            "address":{
              "street_1":"1 Hacker Way",
              "street_2":"",
              "city":"Menlo Park",
              "postal_code":"94025",
              "state":"CA",
              "country":"US"
            },
            "summary":{
              "subtotal":75.00,
              "shipping_cost":4.95,
              "total_tax":6.19,
              "total_cost":56.14
            },
            "adjustments":[
              {
                "name":"New Customer Discount",
                "amount":20
              },
              {
                "name":"$10 Off Coupon",
                "amount":10
              }
            ]
          }
        }
    }); 
    
}


function sendButtonMessage(sender){
     sendMessage(sender, {
        attachment:{
          type:"template",
          payload:{
            template_type:"button",
                text:"What do you want to do next?",
                buttons:[
                  {
                    type:"web_url",
                    url:"https://petersapparel.parseapp.com",
                    title:"Show Website"
                  },
                  {
                    type:"postback",
                    title:"Start Chatting",
                    payload:"USER_DEFINED_PAYLOAD"
                  }
                ]
          }
        }
    }); 
    
}

function sendTypingOnMessage(sender){
    request
        .post('https://graph.facebook.com/v2.6/me/messages')
        .query({access_token: pageToken})
        .send({
            recipient: {
                id: sender
            },
            sender_action:"typing_on"
        })
        .end(function (err, res) {
            if (err) {
                console.log('Error sending message: ', err);
            } else if (res.body.error) {
                console.log('Error: ', res.body.error);
            }
        });
}
function sendTypingOffMessage(sender){
    request
        .post('https://graph.facebook.com/v2.6/me/messages')
        .query({access_token: pageToken})
        .send({
            recipient: {
                id: sender
            },
            sender_action:"typing_off"
        })
        .end(function (err, res) {
            if (err) {
                console.log('Error sending message: ', err);
            } else if (res.body.error) {
                console.log('Error: ', res.body.error);
            }
        });
    
}


function sendVideoMessage( sender ){
    sendMessage(sender, {
        attachment:{
          type:"video",
          payload:{
            url:"http://24bopt.com/html/option/video/24boption_promo_video.mp4"
          }
        }
    });      
}
 
function sendFileMessage (sender) {
    sendMessage(sender, {
        attachment:{
          type:"file",
          payload:{
            url:"https://petersapparel.com/bin/receipt.pdf"
          }
        }
    });
}

function sendAudioMessage (sender) {
    sendMessage(sender, {
        attachment:{
          type:"audio",
          payload:{
            url:"http://ol1.mp3party.net/online/51/51711.mp3"
          }
        }
    });
}

function sendImageMessage (sender) {
     sendMessage(sender, {
        attachment:{
          type:"image",
          payload:{
            url:"http://messengerdemo.parseapp.com/img/rift.png"
          }
        }
    });
}


function sendTextMessage (sender, text) {
    sendMessage(sender, {
        text: text
    });
}

function sendGenericMessage (sender) {
    sendMessage(sender, {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'generic',
                elements: [{
                    title: 'First card',
                    subtitle: 'Element #1 of an hscroll',
                    image_url: 'http://messengerdemo.parseapp.com/img/rift.png',
                    buttons: [{
                        type: 'web_url',
                        url: 'https://www.messenger.com/',
                        title: 'Web url'
                    }, {
                        type: 'postback',
                        title: 'Postback',
                        payload: 'Payload for first element in a generic bubble'
                    }]
                }, {
                    title: 'Second card',
                    subtitle: 'Element #2 of an hscroll',
                    image_url: 'http://messengerdemo.parseapp.com/img/gearvr.png',
                    buttons: [{
                        type: 'postback',
                        title: 'Postback',
                        payload: 'Payload for second element in a generic bubble'
                    }]
                }]
            }
        }
    });
}

