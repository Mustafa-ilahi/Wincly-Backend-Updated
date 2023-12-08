const mongoose = require(`mongoose`);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
    require: true,
  },
  location: {
    type: String,
    require: true,
  },
  firstname: {
    type: String,
    require: true,
  },
  lastname: {
    type: String,
    require: true,
  },
  profileImg: {
    type: String,
    require: true,
  },
  bestPicture: {
    type: Array,
    require: true,
  },
  DOB: {
    type: String,
    require: true,
  },
  lookingFor: {
    type: String,
    require: true,
  },
  kindFriend: {
    type: Object,
    require: true,
  },
  interest: {
    type: Array,
    require: true,
  },
  about: {
    type: String,
    require: true,
  },
  like: {
    type: Array,
  },
  userStatus: {
    type: String,
  },
  age: {
    type: String,
  },
  allChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "chatRoom" }],
  myOrganizedEvent: [{ type: mongoose.Schema.Types.ObjectId, ref: "event" }],
  myParticipateEvent: [{ type: mongoose.Schema.Types.ObjectId, ref: "event" }],
  myReviews: [
    {
      quantity: { type: Number },
      text: { type: String },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'event' }
    }
  ],
  myWallet: {
    type: Number
  },
  deviceToken: { type: String },
  joinReq: [
    {
      eventParticipantsData: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      eventOrganizerData: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      eventTitle: { type: String },
      eventData: { type: mongoose.Schema.Types.ObjectId, ref: 'event' }
    }
  ],
  acceptReq: [
    {
      eventParticipantsData: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      eventOrganizerData: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      eventTitle: { type: String },
      eventData: { type: mongoose.Schema.Types.ObjectId, ref: 'event' }
    }
  ],
  rejectReq: [
    {
      eventParticipantsData: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      eventOrganizerData: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      eventTitle: { type: String },
      eventData: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
      reason: { type: String }
    }
  ], 
  myPostedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});
const locationSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
});
const chatRoomSchema = new mongoose.Schema({
  chatroomName: {
    type: String,
  },
  userDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  userDetails2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  messages: {
    type: Array,
  },
});
const eventSchema = new mongoose.Schema({
  imageUri: {
    type: String,
  },
  eventDis: {
    type: String,
  },
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  noOfPerson: {
    type: Number,
  },
  title: {
    type: String,
  },
  postTime: {
    type: String,
  },
  eventOrganizerData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  eventParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

const userCheck = mongoose.model(`users`, userSchema);
const locationCheck = mongoose.model(`location`, locationSchema);
const chatRoomCheck = mongoose.model(`chatRoom`, chatRoomSchema);
const eventCheck = mongoose.model(`event`, eventSchema);

module.exports = { userCheck, locationCheck, chatRoomCheck, eventCheck };
