const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file, 'File');

    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    console.log(file, 'File');
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({storage: storage, limits: {fileSize: 20000000}});
module.exports = {
  upload,
};

//--------------

const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({message: 'No file uploaded'});
  }
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
  return res
    .status(200)
    .json({message: 'File uploaded successfully', imageUrl: fileUrl});
};

//-------------
headers['Content-Type'] = 'multipart/form-data';
headers['redirect'] = 'follow';

//--------------------

//---------------

if (body) {
  if (method == 'POST' || method == 'PUT') {
    if (formData == true) {
      configs['body'] = jsonToFormdata(body);
    } else {
      configs['body'] = JSON.stringify(body);
    }
  }
}
