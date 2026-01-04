import { BookingModel, Booking, BookingStatus } from './booking.model';

export async function createBooking(bookingData: Partial<Booking>) {
  try {
    return await BookingModel.create(bookingData);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function findBookingById(id: string) {
  try {
    return await BookingModel.findById(id);
  } catch (error) {
    console.error('Error finding booking:', error);
    throw error;
  }
}

export async function findBookingsByProperty(propertyId: string) {
  try {
    return await BookingModel.find({ propertyId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error finding bookings by property:', error);
    throw error;
  }
}

export async function findBookingsByLandlord(landlordId: string) {
  try {
    return await BookingModel.find({ landlordId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error finding bookings by landlord:', error);
    throw error;
  }
}

export async function findBookingsByTenant(tenantEmail: string) {
  try {
    return await BookingModel.find({ tenantEmail }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error finding bookings by tenant:', error);
    throw error;
  }
}

export async function approveBooking(bookingId: string) {
  try {
    return await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: BookingStatus.APPROVED,
        landlordApprovalDate: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error approving booking:', error);
    throw error;
  }
}

export async function rejectBooking(bookingId: string, reason: string) {
  try {
    return await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: BookingStatus.REJECTED,
        landlordRejectionReason: reason,
        landlordApprovalDate: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error rejecting booking:', error);
    throw error;
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    return await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: BookingStatus.CANCELLED,
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}

export async function completeBooking(bookingId: string) {
  try {
    return await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: BookingStatus.COMPLETED,
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error completing booking:', error);
    throw error;
  }
}

export async function updateBooking(bookingId: string, updateData: Partial<Booking>) {
  try {
    return await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}
