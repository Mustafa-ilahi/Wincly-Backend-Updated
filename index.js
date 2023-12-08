const express = require(`express`);
const cors = require(`cors`);
require(`dotenv`).config();
const db = require(`./config/db`);
const socket = require(`socket.io`);
const { userCheck, chatRoomCheck, eventCheck } = require("./schema");
const { default: mongoose } = require("mongoose");
const admin = require("firebase-admin")
const serviceAccount = require("./config/wincly-11c40-firebase-adminsdk-g756t-ea26cad4c2.json")
const mongoURL = process.env.MONGO_URL


const app = express();
app.use(cors());
app.use(express.json());

app.get(`/`, (req, res) => {
  res.send({
    status: 200,
    message: "server run successfully!Wincly",
  });
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server run on port ${process.env.PORT}`);
});

// db.connection
//   .once(`open`, () => console.log(`mongodb connected`))
//   .on(`error`, (error) => console.log(`mongodbError===>`, error));

mongoose.
  connect(mongoURL)
  .then((res) => console.log('db connected'))
  .catch((error) => console.log('db connection error====>', error))

app.use(`/api`, require(`./rootRoute`));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL:db
})

const sendPushNotification = (deviceToken, payload) => {
  admin.messaging().sendToDevice(deviceToken, payload)
    .then((res) => {
      console.log("Notification send", res);
    })
    .catch((error) => {
      console.log('Error in notification send', error);
    })
}

const deviceToken = 'd9J4US6xT6mdy_21d97pyc:APA91bGfN8fplkcH3CXJOto9VhA-trUbKlWWed3pcRcXgUsxytDirR9BTPZtqUGN5zu0FKlyphZOIbxTlNZaLUaTgpm9cA4NDY27H2kh2tetxJY02eQNMpuOOJq45NDu5imEGyb9qHlX';
const notificationPayload = {
  notification: {
    title: 'Sample Notification',
    body: 'This is a test notification from your Node.js server.',
  },
  data: {
    redirectTo: 'Location'
  }
};
// sendPushNotification(deviceToken, notificationPayload);

// ================================ SOCKET IO WORK ===========================

const io = socket(server);

io.on(`connection`, async (socket) => {
  // console.log("user Connected");

  socket.on("set user", async (userData) => {
    socket.userData = userData;
    console.log(`${userData.username} connected ${userData._id}`);
    // console.log("userData------>", userData);
    const { _id, userStatus } = userData;
    if (_id) {
      const updateData = await userCheck.findOneAndUpdate(
        { _id },
        { userStatus: userStatus },
        { new: true }
      );
      socket.broadcast.emit(`usersUserStatus`, { data: updateData });
    }
  });

  socket.on("eventAccepted", async (data) => {
    console.log("work");
    const eventParticipantsId = data?.eventParticipantsData?._id
    const eventOrganizerId = data?.eventOrganizerData?._id
    const eventTitle = data?.eventTitle
    const eventId = data?.eventData?._id

    let eventParticipantsData = new mongoose.Types.ObjectId(eventParticipantsId)
    let eventOrganizerData = new mongoose.Types.ObjectId(eventOrganizerId)
    let eventData = new mongoose.Types.ObjectId(eventId)

    const findNoOfPerson = "noOfPerson";
    const findEventParticipants = "eventParticipants";
    console.log(eventId);
    const document = await eventCheck.findById({ _id: eventId })
    console.log("done");
    if (document) {
      const noOfPerson = document[findNoOfPerson]
      const eventParticipants = document[findEventParticipants]
      console.log(noOfPerson, eventParticipants.length);

      if (eventParticipants.length < noOfPerson) {
        if (eventParticipants.some((objectId) => objectId.toString() === eventParticipantsId)) {
          console.log('this user already in event participent');
          const reason = 'alreadyParticipent'
          const obj = {
            eventParticipantsData,
            eventOrganizerData,
            eventTitle,
            eventData,
            reason
          }
          await userCheck.findByIdAndUpdate(
            { _id: eventParticipantsId },
            { $push: { rejectReq: obj } }
          )
          const userDocument = await userCheck.findById({ _id: eventParticipantsId })
          const deviceToken = userDocument.deviceToken
          if (deviceToken) {
            const notificationPayload = {
              notification: {
                title: 'Event request decline',
                body: `Your request for joining event ${eventTitle} has been declined because you're already in the list of participants.`,
              },
              data: {
                type: 'Event',
                redirectTo: 'Notifications',
                typeOf: 'rejectReq',
                // data: dataForNotification
              }
            };
            sendPushNotification(deviceToken, notificationPayload);
            data.reason = reason
            io.emit("sendEventDeclined", data);
          }

        } else {
          console.log("add kro");
          const obj = {
            eventParticipantsData,
            eventOrganizerData,
            eventTitle,
            eventData,
          }
          await eventCheck.updateOne(
            { _id: eventId },
            { $push: { eventParticipants: eventParticipantsData } }
          );
          await userCheck.updateOne(
            { _id: eventParticipantsId },
            { $push: { myParticipateEvent: eventData } }
          )
          await userCheck.findByIdAndUpdate(
            { _id: eventParticipantsId },
            { $push: { acceptReq: obj } }
          )
          const userDocument = await userCheck.findById({ _id: eventParticipantsId })
          const deviceToken = userDocument.deviceToken
          console.log(deviceToken);
          if (deviceToken) {
            const notificationPayload = {
              notification: {
                title: 'Event request accepted',
                body: `${data?.eventOrganizerData?.username} accept your's request for join ${data.eventTitle} event.`,
              },
              data: {
                type: 'Event',
                redirectTo: 'Notifications',
                typeOf: 'acceptReq',
                // data: dataForNotification
              }
            };
            sendPushNotification(deviceToken, notificationPayload);
            io.emit("sendEventAccepted", data);
          }
        }
      } else {
        console.log("bari hai kam nh ho g");
        const reason = 'participantListFull'
        const obj = {
          eventParticipantsData,
          eventOrganizerData,
          eventTitle,
          eventData,
          reason
        }
        await userCheck.findByIdAndUpdate(
          { _id: eventParticipantsId },
          { $push: { rejectReq: obj } }
        )
        const userDocument = await userCheck.findById({ _id: eventParticipantsId })
        const deviceToken = userDocument.deviceToken
        if (deviceToken) {
          const notificationPayload = {
            notification: {
              title: 'Event request decline',
              body: `You can't join ${eventTitle} event. The limit for number of participants is already exceeded`,
            },
            data: {
              type: 'Event',
              redirectTo: 'Notifications',
              typeOf: 'rejectReq',
              // data: dataForNotification
            }
          };
          sendPushNotification(deviceToken, notificationPayload);
          data.reason = reason
          io.emit("sendEventDeclined", data);
          console.log("all work done full list ka");
        }
      }

    }
  });
  socket.on("eventDeclined", async (data) => {
    const dataForNotification = JSON.stringify(data)
    const eventParticipantsId = data?.eventParticipantsData?._id
    const eventOrganizerId = data?.eventOrganizerData?._id
    const eventTitle = data?.eventTitle
    const eventId = data?.eventData?._id

    let eventParticipantsData = new mongoose.Types.ObjectId(eventParticipantsId)
    let eventOrganizerData = new mongoose.Types.ObjectId(eventOrganizerId)
    let eventData = new mongoose.Types.ObjectId(eventId)
    let reason = 'eventOrgDecline'

    const obj = {
      eventParticipantsData,
      eventOrganizerData,
      eventTitle,
      eventData,
      reason
    }

    await userCheck.findByIdAndUpdate(
      { _id: eventParticipantsId },
      { $push: { rejectReq: obj } }
    )
    const document = await userCheck.findById({ _id: eventParticipantsId })
    const deviceToken = document.deviceToken
    if (deviceToken) {
      const notificationPayload = {
        notification: {
          title: 'Event request decline',
          body: `${data?.eventOrganizerData?.username} declines your's request for join ${data.eventTitle} event.`,
        },
        data: {
          type: 'Event',
          redirectTo: 'Notifications',
          typeOf: 'rejectReq',
          // data: dataForNotification
        }
      };
      sendPushNotification(deviceToken, notificationPayload);
      data.reason = reason
      io.emit("sendEventDeclined", data);
    }
  });
  socket.on("eventJoinReq", async (data) => {
    const eventData = JSON.stringify(data)
    const eventOrgId = data.eventOrganizerData._id
    const document = await userCheck.findById({ _id: eventOrgId })
    const deviceToken = document.deviceToken
    if (deviceToken) {
      const notificationPayload = {
        notification: {
          title: 'Event join request',
          body: `${data.eventParticipantsData.username} wants to join your ${data.eventTitle} event.`,
        },
        data: {
          type: 'Event',
          redirectTo: 'Notifications',
          typeOf: 'joinReq',
        }
      };
      sendPushNotification(deviceToken, notificationPayload);
      io.emit("sendEventJoinReq", data);
    }
  });
  socket.on('sendLikeData', async (data) => {
    io.emit("receivedLikeData", data);
  })
  socket.on('sendLikeMatch', async (data) => {
    const _id = data.userId
    const username = data.userData.username
    const document = await userCheck.findById({_id})
    const deviceToken = document.deviceToken
    if(deviceToken){
      const notificationPayload = {
        notification: {
          title: 'Its a match!.',
          body: `Your have a new match with ${username}.`,
        },
        data: {
          type: 'LikeMatch',
          redirectTo: 'ChatRoom',
          chatRoomId: data.chatroomId
        }
      };
      sendPushNotification(deviceToken, notificationPayload);
    }
  })
  socket.on('sendMessage', async (data) => {
    console.log(data);
    const receiverId = data.receiverId
    const document = await userCheck.findById({ _id: receiverId })
    const deviceToken = document.deviceToken
    if (deviceToken) {
      const notificationPayload = {
        notification: {
          title: `${data?.name}`,
          body: `${data?.data?.message}`,
        },
        data: {
          type: 'Message',
          redirectTo: 'ChatRoom',
          typeOf: 'joinReq',
          chatRoomId: data.chatroomId
        }
      };
      sendPushNotification(deviceToken, notificationPayload);
      io.emit("receiveMessage", data);
      io.emit("receiveMessageForInbox", data);
    } else {
      io.emit("receiveMessage", data);
      io.emit("receiveMessageForInbox", data);
    }
  })

  socket.on(`disconnect`, async (data) => {
    const userData = socket.userData;
    if (userData) {
      console.log(`${userData.username} disconnected ${userData._id}`);
      const { _id } = userData;
      if (_id) {
        const updateData = await userCheck.findOneAndUpdate(
          { _id },
          { userStatus: "Offline" },
          { new: true }
        );
        socket.broadcast.emit(`usersUserStatus`, { data: updateData });
      }
    }
  });
});


