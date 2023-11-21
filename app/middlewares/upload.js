const util = require("util");
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.isdu0x1.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = Date.now() + path.extname(file.originalname);
      const fileInfo = {
        filename: filename,
        bucketName: 'uploads'
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({ storage }).single('file');
const uploadFilesMiddleware = util.promisify(upload);
module.exports = uploadFilesMiddleware;