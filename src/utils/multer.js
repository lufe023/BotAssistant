const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../uploads/images"));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

module.exports = upload;
