const express = require(`express`);
const router = express.Router();

const {
  signup,
  login,
  forgotPassOtp,
  updatePassword,
  updateProfile,
  Otp,
  allUser,
  checkEmail,
  location,
  singleUser,
  addLike,
  createChatRoom,
  getSingleChatRoom,
  addMessageInChatRoom,
  allChatRoom,
  updateSeenKey,
  allPost,
  joinEvent,
  uploadEvent,
  allEvent,
  postReview,
  updateDeviceToken,
  addJoinReqnotification,
  removeReqNotification,
  findExistingChatroom,
  getEvent,
  addLikeWithIncWallet,
} = require(`../controllers/winclyControllers`);

router.post(`/signup`, signup);
router.post(`/login`, login);
router.post(`/forgotPassOtp`, forgotPassOtp);
router.post(`/updatePassword`, updatePassword);
router.post(`/updateProfile`, updateProfile);
router.post(`/otp`, Otp);
router.get(`/allUser`, allUser);
router.post(`/singleUser`, singleUser);
router.post(`/checkEmail`, checkEmail);
router.get(`/location`, location);
router.post(`/addLike`, addLike);
router.post(`/createChatRoom`, createChatRoom);
router.post(`/getSingleChatRoom`, getSingleChatRoom);
router.post(`/sendMessage`, addMessageInChatRoom);
router.get(`/allChatRoom`, allChatRoom);
router.post(`/updateSeenKey`, updateSeenKey);
router.post(`/uploadEvent`, uploadEvent);
router.get(`/allEvent`, allEvent);
router.post(`/joinEvent`, joinEvent);
router.post(`/postReview`, postReview);
router.post(`/updateDeviceToken`, updateDeviceToken);
router.post(`/addJoinReqnotification`, addJoinReqnotification);
router.post(`/removeReqNotification`, removeReqNotification);
router.post(`/findExistingChatroom`, findExistingChatroom);
router.post(`/getEvent`, getEvent);
router.post(`/addLikeWithIncWallet`, addLikeWithIncWallet);

module.exports = router;
