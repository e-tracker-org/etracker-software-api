import { FileItem, FileItemModel } from './upload.model';

async function createDocs(files: FileItem[]) {
  return await FileItemModel.insertMany(files);
}

async function getAllFiles() {
  return await FileItemModel.find();
}

async function getFileById(id: string) {
  return FileItemModel.findById(id);
}

export async function deleteFileById(id: string) {
  return FileItemModel.findByIdAndDelete(id);
}

async function purgeDocs() {
  return await FileItemModel.remove();
}

export async function createOrUpdateDocs(files: FileItem[]) {
  const bulkOps = files.map((file) => {
    const { userId, docTypeID, ...data } = file; // Extract userId and docTypeID from file object
    return {
      updateOne: {
        filter: { userId, docTypeID }, // Filter based on userId and docTypeID
        update: { $set: data }, // Update the document with the new data
        upsert: true, // Create a new document if it doesn't exist
      },
    };
  });

  return await FileItemModel.bulkWrite(bulkOps);
}

export async function getFilesByUserIdAndDocTypeId(userId: string, docTypeId: number) {
  return await FileItemModel.findOne({userId: userId, docTypeID: docTypeId });
}

export async function deleteOneFileByFileId(id: string) {
  return await FileItemModel.deleteOne({_id: id})
}

export { createDocs, getAllFiles, getFileById, deleteById, purgeDocs };
