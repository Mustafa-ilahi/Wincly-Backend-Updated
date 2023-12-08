const {
  userCheck,
  locationCheck,
  chatRoomCheck,
  eventCheck,
} = require(`../schema/index`);
const bcrypt = require(`bcrypt`);
require(`dotenv`).config();
const otpGenerator = require(`otp-generator`);
const nodemailer = require(`nodemailer`);
const db = require(`../config/db`);
const mongoose = require(`mongoose`);
const fs = require('fs');
const path = require('path');

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const twilioNum = process.env.TWILIO_NUMBER;

const client = require(`twilio`)(accountSid, authToken);

module.exports.signup = async (req, res) => {
  const {
    username,
    email,
    password,
    phoneNumber,
    location,
    firstname,
    lastname,
    profileImg,
    bestPicture,
    DOB,
    lookingFor,
    kindFriend,
    interest,
    about,
    like,
    userStatus,
    age,
    deviceToken,
    joinReq,
    acceptReq,
    rejectReq
  } = req.body.userData;
  // console.log("age--------->" , age);
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const userCheckRes = await userCheck({
      username,
      email,
      password: hashPassword,
      phoneNumber,
      location,
      firstname,
      lastname,
      profileImg,
      bestPicture,
      DOB,
      lookingFor,
      kindFriend,
      interest,
      about,
      like,
      userStatus,
      age,
      allChats: [],
      myOrganizedEvent: [],
      myParticipateEvent: [],
      myReviews: [],
      myWallet: 0,
      deviceToken,
      joinReq,
      acceptReq,
      rejectReq
    });
    const saveRes = await userCheckRes.save();

    res.send({
      status: 200,
      message: `signup successfully!`,
      data: saveRes,
    });
  } catch (error) {
    res.send({
      status: 200,
      message: error.message,
    });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userData = await userCheck.find({ email });
    if (userData.length > 0) {
      const hashedPassword = userData[0].password;
      const compairHashedPasswordRes = await bcrypt.compare(
        password,
        hashedPassword
      );
      if (compairHashedPasswordRes) {
        res.send({
          status: 200,
          message: "Login successfully!",
          data: userData,
        });
      } else {
        res.send({
          status: 500,
          message: "*Incorrect password.",
        });
      }
    } else {
      res.send({
        status: 500,
        message: "*User not found.",
      });
    }
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.forgotPassOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const existingEmail = await userCheck.findOne({ email });
    if (existingEmail) {
      const otp = otpGenerator.generate(4, {
        lowerCaseAlphabets: false,
        specialChars: false,
        upperCaseAlphabets: false,
      });

      const htmlFilePath = path.join(__dirname, '../html/forNodeMail.html');
      let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
      
      const transpoter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
          // go your google account setting .then 2 step verification .then
          // at last have an option app password .then {select app = mail} .then {select device = windown computer}
          // .then create app pass and paste password
        },
      });
      htmlContent = htmlContent.replace('{{otp}}', otp);
      const info = {
        from: process.env.USER,
        to: email,
        subject: "Wincly Forgot Password Request",
        // text: `Your verification code is <${otp}>`,
        html: htmlContent,
      };

      transpoter.sendMail(info, (error, result) => {
        if (error) {
          // console.log("Error in sending mail===>", error);
          res.send({
            status: 500,
            message: error.message,
          });
        } else {
          console.log("mail send===>", info);
          res.send({
            status: 200,
            message: "forget password email send successfully!",
            otp,
          });
        }
      });
    } else {
      res.send({
        status: 200,
        message: "Oops! User not found.",
      });
    }
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.updatePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const updatePassword = await userCheck.findOneAndUpdate(
      { email },
      { password: hashPassword }
    );
    res.send({
      status: 200,
      message: "Password Update succesfully!",
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.updateProfile = async (req, res) => {
  const {
    _id,
    username,
    phoneNumber,
    DOB,
    location,
    interest,
    profileImg,
    about,
    bestPicture,
  } = req.body;
  try {
    const updateData = await userCheck.findByIdAndUpdate(
      { _id },
      {
        username,
        phoneNumber,
        DOB,
        location,
        interest,
        profileImg,
        about,
        bestPicture,
      },
      {
        new: true,
      }
    );
    res.send({
      status: 200,
      message: "Update succesfully!",
      data: updateData,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.Otp = (req, res) => {
  const { phone } = req.body;
  console.log(phone);
  const otp = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });

  try {
    client.messages.create({
      body: `Yout wincly OTP is ${otp}`,
      from: twilioNum,
      to: phone,
    });
    res.send({
      status: 200,
      message: "Send OTP successfully!",
      data: otp,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.allUser = async (req, res) => {
  try {
    const usersData = await userCheck.find().populate("allChats");
    res.send({
      status: 200,
      message: "all user Data",
      data: usersData,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const existingEmail = await userCheck.findOne({ email });
    if (existingEmail) {
      res.send({
        status: 200,
        message: "email already in use.",
        // data: existingEmail,
      });
    } else {
      res.send({
        status: 200,
        message: "email",
        // data: existingEmail,
      });
    }
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.location = async (req, res) => {
  try {
    const usersData = await locationCheck.find();
    res.send({
      status: 200,
      message: "location",
      data: usersData,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.singleUser = async (req, res) => {
  const { _id } = req.body;
  try {
    const usersData = await userCheck
      .findOne({
        _id,
      })
      .populate({
        path: "allChats",
        populate: {
          path: "userDetails userDetails2",
          modal: "users",
        },
      })
      .populate({
        path: "myOrganizedEvent",
        populate: {
          path: "eventOrganizerData eventParticipants",
          modal: "users",
        },
      })
      .populate({
        path: "myParticipateEvent",
        populate: {
          path: "eventOrganizerData eventParticipants",
          modal: "users",
        },
      })
      .populate({
        path: "myReviews.eventId",
        modal: "event"
      })
      .populate({
        path: "myReviews.user",
        modal: "users"
      })
      .populate({
        path: "joinReq",
        populate: {
          path: "eventParticipantsData eventOrganizerData",
          modal: "users",
        },
      })
      .populate({
        path: "joinReq",
        populate: {
          path: "eventData",
          modal: "event",
        },
      })
      .populate({
        path: "rejectReq",
        populate: {
          path: "eventParticipantsData eventOrganizerData",
          modal: "users",
        },
      })
      .populate({
        path: "rejectReq",
        populate: {
          path: "eventData",
          modal: "event",
        },
      })
      .populate({
        path: "acceptReq",
        populate: {
          path: "eventParticipantsData eventOrganizerData",
          modal: "users",
        },
      })
      .populate({
        path: "acceptReq",
        populate: {
          path: "eventData",
          modal: "event",
        },
      })


    res.send({
      status: 200,
      message: "User Data",
      data: usersData,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.addLike = async (req, res) => {
  const { _id, likeId } = req.body;

  try {
    const addLike = await userCheck.updateOne(
      { _id },
      { $push: { like: likeId } }
    );
    res.send({
      status: 200,
      message: "Ad like succesfully!",
      data: addLike,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.addLikeWithIncWallet = async (req, res) => {
  const { _id, likeId, userId } = req.body;

  try {
    const addLike = await userCheck.updateOne(
      { _id },
      {
        $push: { like: likeId },
        $inc: { myWallet: 1 }
      }
    );
    const addLikeForUser = await userCheck.updateOne(
      { _id: userId },
      {
        $inc: { myWallet: 1 },
      }
    );
    res.send({
      status: 200,
      message: "Ad like succesfully!",
      data: addLike,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.createChatRoom = async (req, res) => {
  const { chatroomName, userDetails, userDetails2, messages } = req.body;
  try {
    const chatRoomRes = await chatRoomCheck({
      chatroomName,
      userDetails,
      userDetails2,
      messages,
    });
    const chatRoomSaveRes = await chatRoomRes.save();

    const populatedChatRoom = await chatRoomCheck.findById(chatRoomSaveRes._id)
      .populate('userDetails')
      .populate('userDetails2')
      .exec();

    let chatRoomId = new mongoose.Types.ObjectId(chatRoomSaveRes.id);

    const documentIds = [userDetails, userDetails2];
    await userCheck.updateMany(
      { _id: { $in: documentIds } },
      { $push: { allChats: chatRoomId } }
    );
    res.send({
      status: 200,
      message: "chatRoom save Successfully!",
      data: populatedChatRoom,
    });
  } catch (error) {
    res.send({
      status: 200,
      message: error.message,
    });
  }
};

module.exports.getSingleChatRoom = async (req, res) => {
  const { _id } = req.body;
  try {
    const singleChatRoom = await chatRoomCheck
      .find({ _id })
      .populate("userDetails userDetails2");
    res.send({
      status: 200,
      message: "chat room found.",
      data: singleChatRoom,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.findExistingChatroom = async (req, res) => {
  const { _id1, _id2 } = req.body
  try {
    const chatroomName = _id1 + _id2
    const existingChat = await chatRoomCheck.findOne({ chatroomName })
    if (existingChat) {
      res.json({ success: true, message: 'Existing chat.', chatId: existingChat._id })
    } else {
      const chatroomName2 = _id2 + _id1
      const existingChatroom = await chatRoomCheck.findOne({ chatroomName: chatroomName2 })
      if (existingChatroom) {
        res.json({ success: true, message: 'Existing chat found.', chatId: existingChatroom._id })
      } else {
        const userDetails = _id1;
        const userDetails2 = _id2;
        const messages = [];
        const createChatroom = await chatRoomCheck.create({
          chatroomName,
          userDetails,
          userDetails2,
          messages
        })
        let chatRoomId = new mongoose.Types.ObjectId(createChatroom.id);
        const documentIds = [userDetails, userDetails2];
        await userCheck.updateMany(
          { _id: { $in: documentIds } },
          { $push: { allChats: chatRoomId } }
        );
        res.json({ success: true, message: 'Existing chat not found.Create new chat.', chatId: createChatroom.id })
      }
    }
  } catch (error) {
    res.json({ success: false, message: error })
  }
}

module.exports.addMessageInChatRoom = async (req, res) => {
  const { _id, obj } = req.body;

  try {
    const addMessage = await chatRoomCheck.findOneAndUpdate(
      { _id },
      { $push: { messages: obj } },
      { new: true, projection: { messages: { $slice: -1 } } }
    );

    const updatedMessage = addMessage.messages[0];

    res.send({
      status: 200,
      message: "ad Message successfully!",
      data: updatedMessage,
      chatroomId: addMessage._id
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.allChatRoom = async (req, res) => {
  try {
    const chatData = await chatRoomCheck
      .find()
      .populate("userDetails userDetails2");
    res.send({
      status: 200,
      message: "All ChatRoom",
      data: chatData,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.updateSeenKey = async (req, res) => {
  const { _id, uid } = req.body;
  try {
    const document = await chatRoomCheck.findOne({ _id });
    if (document) {
      document.messages.forEach((obj) => {
        if (obj.uid !== uid) {
          obj.seen = true;
        }
      });

      const result = await chatRoomCheck.updateOne(
        { _id },
        { $set: { messages: document.messages } }
      );
      res.send({
        status: 200,
        message: "Set all seen true",
        data: result,
      });
    }
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.uploadEvent = async (req, res) => {
  const {
    imageUri,
    eventDis,
    startDate,
    endDate,
    startTime,
    endTime,
    noOfPerson,
    title,
    postTime,
    eventOrganizerData,
    eventParticipants,
  } = req.body.obj;
  // console.log("age--------->", noOfPerson);
  try {
    const postSave = await eventCheck({
      imageUri,
      eventDis,
      startDate,
      endDate,
      startTime,
      endTime,
      noOfPerson,
      title,
      postTime,
      eventOrganizerData,
      eventParticipants,
    });
    const saveRes = await postSave.save();

    let eventId = new mongoose.Types.ObjectId(postSave.id);
    console.log("eventId=--==--=>", eventId);

    console.log("documentIds=-=--==->", eventOrganizerData);
    await userCheck.updateOne(
      { _id: eventOrganizerData },
      { $push: { myOrganizedEvent: eventId } }
    );

    // updateOne(
    //   { _id },
    //   { $push: { messages: obj } }
    // )

    res.send({
      status: 200,
      message: `Event add successfully!`,
      data: saveRes,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};
module.exports.allEvent = async (req, res) => {
  try {
    const allEvent = await eventCheck
      .find()
      .populate("eventOrganizerData eventParticipants");
    res.send({
      status: 200,
      message: "All events.",
      data: allEvent,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.joinEvent = async (req, res) => {
  const { eventId, participantsId } = req.body;

  try {
    const response = await eventCheck.updateOne(
      { _id: eventId },
      { $push: { eventParticipants: participantsId } }
    );
    res.send({
      status: 200,
      message: "Event join successfully!",
      data: response,
    });
  } catch (error) {
    res.send({
      status: 200,
      message: error.message,
    });
  }
};

module.exports.postReview = async (req, res) => {
  const { quantity, text, id, userId, reviewPostId } = req.body;
  let eventId = new mongoose.Types.ObjectId(id);
  let user = new mongoose.Types.ObjectId(reviewPostId)
  const obj = {
    quantity,
    text,
    eventId,
    user
  };
  try {
    const addReview = await userCheck.findByIdAndUpdate(
      { _id: userId },
      {
        $push: { myReviews: obj },
        $inc: { myWallet: 1 }
      },
    );

    const updatedUser = await userCheck.findById(userId, { myReviews: { $slice: -1 } });

    const reviewId = updatedUser.myReviews[0]._id;

    await userCheck.findByIdAndUpdate(
      { _id: reviewPostId },
      { $push: { myPostedReviews: reviewId } },
    );

    console.log(reviewId);
    res.send({
      status: 200,
      message: "Review added!",
      data: addReview
    })
  } catch (error) {
    res.send({
      status: 500,
      message: error
    })
  }
};

module.exports.updateDeviceToken = async (req, res) => {
  const { _id, deviceToken } = req.body
  const findUser = await userCheck.findByIdAndUpdate({ _id }, { deviceToken }, { new: true })
  return res.status(200).json({ success: true, message: 'updateDevicetoken', data: findUser })
}
module.exports.addJoinReqnotification = async (req, res) => {
  const { eventParticipantsId, eventOrganizerId, eventTitle, eventId } = req.body
  let eventParticipantsData = new mongoose.Types.ObjectId(eventParticipantsId)
  let eventOrganizerData = new mongoose.Types.ObjectId(eventOrganizerId)
  let eventData = new mongoose.Types.ObjectId(eventId)

  const obj = {
    eventParticipantsData,
    eventOrganizerData,
    eventTitle,
    eventData
  }

  try {
    const updatedDocument = await userCheck.findOneAndUpdate(
      { _id: eventOrganizerId },
      { $push: { joinReq: obj } },
      { new: true, projection: { joinReq: { $slice: -1 } } }
    );

    if (updatedDocument) {
      const updatedJoinReqObject = updatedDocument.joinReq[0]; // Retrieve the pushed object
      return res.json({ success: true, message: 'Join request sent!', data: updatedJoinReqObject });
    } else {
      return res.json({ success: false, message: 'Document not found' });
    }

    // return res.json({ success: true, message: 'Join request sent!', data: addJoinReq })
  } catch (error) {
    return res.json({ success: false, message: error })
  }
}
module.exports.removeReqNotification = async (req, res) => {
  const { userId, joinReqId } = req.body
  try {
    const response = await userCheck.updateOne(
      { _id: userId },
      { $pull: { joinReq: { _id: joinReqId } } }
    )
    if (response.modifiedCount > 0) {
      return res.json({ success: true, message: 'removeReqNotification', data: response })
    } else {
      return res.json({ success: false, message: 'Not updated! try again.' })
    }
  } catch (error) {
    return res.json({ success: false, message: error })
  }
}

module.exports.getEvent = async (req, res) => {
  const { _id } = req.body
  const ObjectId = mongoose.ObjectId
  const documents = await eventCheck.findOne({ eventOrganizerData: _id })
    .sort({ 'postTime': -1 }).limit(1)
  // console.log(documents);
  if (documents) {
    return res.json({ success: true, message: 'Last post time.', postTime: documents?.postTime })
  } else {
    return res.json({ success: false, message: 'Empty.' })
  }
}