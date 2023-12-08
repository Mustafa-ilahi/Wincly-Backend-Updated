const express = require(`express`);
const router = express.Router();

router.use(`/admin`, (req, res) => {
  res.send({
    status: 200,
    message: `admin`,
  });
});

router.use(`/wincly`, require(`./routes/winclyRoutes`));

module.exports = router;
