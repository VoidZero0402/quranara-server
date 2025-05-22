import multer from "multer";

const multerStorage = (diskPath = "") => {
    return multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, diskPath);
        },
        filename: (req, file, callback) => {
            callback(null, file.originalname);
        },
    });
};

export default multerStorage;
