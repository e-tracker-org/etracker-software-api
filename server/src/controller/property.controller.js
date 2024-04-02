const db = require('../models');

const Properties = db.properties;
const Files = db.files;

exports.findAll = (req, res) => {
  // if (!req.headers.authorization) {
  //   return res.status(401).send({ message: "Unauthorized request" });
  // }
  Properties.find()
    .then(async (data) => {
      const sortedData = data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      const updatedPropertyList = [];

      for (const property of data) {
        const imagePromises = property.image_list.map((fileId) => getFileById(fileId.toString()));

        const images = await Promise.all(imagePromises);
        property._doc.image_list = images;

        updatedPropertyList.push(property);
      }
      res.status(200).send(sortedData);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving employees.',
      });
    });
};

const getFileById = async (fileId) => {
  try {
    const file = await Files.findOne({ _id: fileId });
    return file;
  } catch (err) {
    return null;
  }
};
