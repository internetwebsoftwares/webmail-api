const router = require("express").Router();
const Email = require("../Models/emailModel");
const User = require("../Models/userModel");
const isEmail = require("validator/lib/isEmail");
const auth = require("../Middlewares/auth");

//Send an email
router.post("/email/new", auth, async (req, res) => {
  let { to, message, subject } = req.body;
  if (!to) {
    return res.send("Please enter receiver email address");
  }
  if (!message) {
    return res.send("Please enter your message");
  }
  if (!isEmail(to)) {
    return res.send("Please enter a valid email address");
  }

  try {
    const sendingTo = await User.findOne({ email: to });
    if (!sendingTo) {
      return res.send("There is no user with that email address");
    }

    const email = new Email({
      from: req.user.email,
      to: sendingTo.email,
      message,
      subject,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      receiverName: `${sendingTo.firstName} ${sendingTo.lastName}`,
    });

    await email.save();
    res.send(`Email has been sent to: ${sendingTo.email}`);
  } catch (error) {
    res.status(500).send(error);
  }
});

//All your emails (received)
router.get("/emails/received", auth, async (req, res) => {
  try {
    const receivedEmails = await Email.find({
      to: req.user.email,
    }).sort({ createdAt: "-1" });
    res.send(receivedEmails);
  } catch (error) {
    res.status(500).send(error);
  }
});

//All your sent emails
router.get("/emails/sent", auth, async (req, res) => {
  try {
    const sentEmails = await Email.find({
      from: req.user.email,
    });
    res.send(sentEmails);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Read one message
router.get("/message/:id", auth, async (req, res) => {
  try {
    const mail = await Email.findById(req.params.id);
    mail.read = true;
    await mail.save();
    res.send(mail);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Delete all of your inbox email
router.delete("/messages/inbox/delete/all", auth, async (req, res) => {
  try {
    const receivedEmails = await Email.find({ to: req.user.email });
    receivedEmails.forEach(async (email) => await email.remove());
    res.send("All your emails have been deleted");
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
