import jsPDF from 'jspdf';

export function generateBookingReceipt(booking: any) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(234, 88, 12); // orange-600
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('OM SAI TRAVELS', 20, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Vehicle Booking & Airport Transfer Services', 20, 27);
  doc.text('Booking Receipt', 20, 35);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Booking ID box
  doc.setFillColor(255, 247, 237); // orange-50
  doc.roundedRect(10, 48, 190, 20, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking ID: ' + booking.bookingId, 20, 61);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Status: ' + booking.bookingStatus, 130, 61);
  
  let y = 80;
  
  // Helper functions
  const addSection = (title: string) => {
    doc.setFillColor(249, 115, 22); // orange-500
    doc.setTextColor(255, 255, 255);
    doc.rect(10, y - 6, 190, 10, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, y + 1);
    doc.setTextColor(0, 0, 0);
    y += 8;
  };
  
  const addRow = (label: string, value: string) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(label + ':', 14, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(value || '-', 80, y + 5);
    y += 8;
  };
  
  // Customer Details
  addSection('CUSTOMER DETAILS');
  addRow('Name', booking.userName || booking.name || 'N/A');
  addRow('Mobile', booking.userMobile || booking.mobile || 'N/A');
  addRow('Email', booking.userEmail || booking.email || '-');
  y += 4;
  
  // Trip Details
  addSection('TRIP DETAILS');
  addRow('Travel Date', booking.travelDate || 'N/A');
  if (booking.pickupTime) addRow('Pickup Time', booking.pickupTime);
  addRow('Pickup Location', booking.pickupLocation || 'N/A');
  addRow('Drop Location', booking.dropLocation || 'N/A');
  if (booking.tripType) addRow('Trip Type', booking.tripType);
  if (booking.flightNumber) addRow('Flight Number', booking.flightNumber);
  y += 4;
  
  // Vehicle Details
  addSection('VEHICLE DETAILS');
  addRow('Vehicle', booking.vehicleName || 'N/A');
  if (booking.vehicleNumber) addRow('Vehicle Number', booking.vehicleNumber);
  if (booking.vehicleType) addRow('Type', booking.vehicleType);
  if (booking.driverName) addRow('Driver', booking.driverName);
  y += 4;
  
  // Seats & Passengers
  addSection('SEATS & PASSENGERS');
  if (booking.seats && booking.seats.length > 0) {
    addRow('Seats', booking.seats.join(', '));
  }
  if (booking.passengerCount) {
    addRow('Passengers Count', String(booking.passengerCount));
  }
  if (booking.passengers?.length) {
    booking.passengers.forEach((p: any, i: number) => {
      addRow(`Passenger ${i+1}`, `${p.name} (Seat: ${p.seatNumber})`);
    });
  }
  y += 4;
  
  // Payment
  addSection('PAYMENT DETAILS');
  addRow('Total Amount', 'Rs. ' + (booking.totalAmount || 0));
  addRow('Paid Amount', 'Rs. ' + (booking.paidAmount || 0));
  addRow('Remaining', 'Rs. ' + (booking.remainingAmount || 0));
  addRow('Payment Status', booking.paymentStatus || 'N/A');
  if (booking.payments?.[0]?.utrNumber) {
    addRow('Transaction ID', booking.payments[0].utrNumber);
  }
  
  // Footer
  y = 280;
  doc.setFillColor(31, 41, 55); // gray-800
  doc.rect(0, y, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2026 Om Sai Travels. All Rights Reserved.', 20, y + 8);
  doc.text('For support: omsaikrupa@gmail.com | +91 8080959502', 20, y + 14);
  
  doc.save(`OST-Receipt-${booking.bookingId || 'Download'}.pdf`);
}
