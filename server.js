const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.post("/checkin", (req, res) => {

    const { latitude, longitude } = req.body;

    console.log(latitude, longitude);

    res.json({
        success: true,
        message: "Check-in thành công"
    });

});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});