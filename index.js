const express = require('express');
const cors = require('cors')
const mailgun = require("mailgun-js");
const port = process.env.PORT || 5000;
const DOMAIN = process.env.DOMAIN
const mg = mailgun({apiKey: process.env.MAIL_KEY, domain: DOMAIN, host: 'api.eu.mailgun.net'});
const mongoPass = process.env.MONGO_PASS;
const mongoUser = process.env.MONGO_USER;
const app = express();
const {
    MongoClient
} = require('mongodb');
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
app.use(express.json());
app.use(cors());
//test

mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to mongodb')
    })
    .catch(err => {
        console.log(err)
    })

const usersSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model('User', usersSchema);



let info = []

app.get('/', (req, res) => {
    res.send('hello worls')
})

app.post('/data', cors(), async (req, res) => {
    const data = await req.body.data
    // console.log(data)
    const user = new User({
        name: data.name,
        email: data.email
    })
    // console.log(user)

    const newUser = await User.findOne({
        email: data.email
    });
    console.log(newUser)
    if (newUser) {
        console.log('already have you')
        res.json({
            msg: 'You have already sent me an email, please wait for me to contact you. Or please check your email, maybe I already have replied to you. Thanks',
            sent: false
        })
        // res.status(300).json({msg: "Already have the user", status: 400})

        res.send()
    } else {
        user.save()
        console.log('saved')


        info = []
        info.push(data)
        // console.log(info)

        res.status(200)
        // res.send("error nodejs")

        const mailDataToMe = {
            from: `${data.name} <${data.name}@${DOMAIN}>`,
            to: `girts@${DOMAIN}`,
            subject: 'Portfolio contact',
            text:`Email is sent from: ${data.email}, by ${data.name} ============================================== ${data.text}`
        };
        mg.messages().send(mailDataToMe, function (error, body) {
            console.log(body);
        });



        const mailData = {
            from: `Girts <girts@${DOMAIN}>`,
            to: `${data.email}`,
            subject: 'Hello',
        	template: "portfolio_response",
            text: "<span style='color: #f72585;'> This is a response to your email <span/> "
        };
        mg.messages().send(mailData, function (error, body) {
            console.log(body);
        });

        res.json({
            msg: 'This is a message from node server, I got your data. visit: https://gkarcevskis-homework-api.herokuapp.com/data for json output',
            sent: true
        })
        res.send()
    }
})

app.get('/data', (req, res) => {
    res.send(info)
})



app.listen(port, () => {
    console.log(`Server listening on port ${port}...`)
})