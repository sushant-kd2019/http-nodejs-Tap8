const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express()
const port = 3000

const ethers = require('ethers');
const PushAPI = require('@pushprotocol/restapi');
const schedule = require('node-schedule');
const { unsubscribe } = require('@pushprotocol/restapi/src/lib/channels');
const PK = process.env.PK;
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);
const CHANNEL_ADDRESS = process.env.CHANNEL_ADDRESS;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/getNotifications', async (req,res) => {

    // console.log(req);
    user_address = req.query.user_address;
    try {
        const notifications = await PushAPI.user.getFeeds({
            user: user_address,
            env: 'staging'
          });
        console.log(notifications);
        res.send(notifications);
    } catch (e) {
        console.error(e);
        res.status(500).send("Unforeseen error has occurred. Sorry for the inconvenience.");
    }
});


app.post('/setExpiryNotification', async (req, res) => {
    try {
        const body = req.body;

        const time_of_notification = body.expiry_time;
        const date = new Date(Number(time_of_notification)*1000);
        
        job = schedule.scheduleJob(date, async function sendExpiryNotification() {
            try {
                const apiRes = await sendNotificationToAddress(
                    body.sender_address,
                    body.reciever_address,
                    "Subscription Ended!",
                    `The subscription duration for ${body.sender_address}'s NFT lent to ${body.reciever_address} is over and it has ended successfully.`,
                    "Subscription Ended!",
                    `The subscription duration for ${body.sender_address}'s NFT lent to ${body.reciever_address} is over and it has ended successfully.`,
                );
            } catch {
                console.log(e);
            }    
        }
        );
    
        res.status(200).send("request successfull.")
    } catch (e) {
        res.status(500).send("request failed.")
        console.error(e);
    }
})




//---------------------------------------------------------------------------------------------------------------------------------------------------------------

async function sendNotificationToAddress(sender_address, reciever_address, title, title_body, payload_title, payload_body) {
    const note1 = await PushAPI.payloads.sendNotification({
        signer,
        type: 3,
        identityType: 0,
        notification: {
          title: title,
          body: title_body
        },
        payload: {
          title: payload_title,
          body: payload_body,
          cta: '',
          img: ''
        },
        recipients: sender_address,
        channel: CHANNEL_ADDRESS,
        env: 'staging'
      });
    
    const note2 = await PushAPI.payloads.sendNotification({
        signer,
        type: 3,
        identityType: 0,
        notification: {
          title: title,
          body: title_body
        },
        payload: {
          title: payload_title,
          body: payload_body,
          cta: '',
          img: ''
        },
        recipients: reciever_address,
        channel: CHANNEL_ADDRESS,
        env: 'staging'
      });
}

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));

