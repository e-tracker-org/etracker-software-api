import { InquiryModel, Inquiry, InquiryStatus } from './inquiry.model';

export async function createInquiry(inquiryData: Partial<Inquiry>) {
  try {
    return await InquiryModel.create(inquiryData);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
}

export async function findInquiryById(id: string) {
  try {
    return await InquiryModel.findById(id);
  } catch (error) {
    console.error('Error finding inquiry:', error);
    throw error;
  }
}

export async function findInquiriesByProperty(propertyId: string) {
  try {
    return await InquiryModel.find({ propertyId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error finding inquiries by property:', error);
    throw error;
  }
}

export async function findInquiriesByLandlord(landlordId: string) {
  try {
    return await InquiryModel.find({ landlordId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error finding inquiries by landlord:', error);
    throw error;
  }
}

export async function findInquiriesByEmail(email: string) {
  try {
    return await InquiryModel.find({ inquirerEmail: email }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error finding inquiries by email:', error);
    throw error;
  }
}

export async function respondToInquiry(inquiryId: string, response: string) {
  try {
    return await InquiryModel.findByIdAndUpdate(
      inquiryId,
      {
        landlordResponse: response,
        status: InquiryStatus.CONTACTED,
        respondedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error responding to inquiry:', error);
    throw error;
  }
}

export async function closeInquiry(inquiryId: string) {
  try {
    return await InquiryModel.findByIdAndUpdate(
      inquiryId,
      {
        status: InquiryStatus.CLOSED,
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error closing inquiry:', error);
    throw error;
  }
}
