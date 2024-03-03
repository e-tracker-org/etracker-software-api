import logger from '../utils/logger';

export async function generateNextId(model: any, idKey: any) {
  const lastDoc = await model.findOne().sort({ idKey: -1 });
  return (lastDoc[idKey] ?? 0) + 1;
}
