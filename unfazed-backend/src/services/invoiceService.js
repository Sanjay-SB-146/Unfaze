export const generateGSTInvoice = ({ invoiceNumber, amountINR, clientName, therapistGSTIN }) => {
  const taxableValue = Math.round(amountINR / 1.18);
  const tax = amountINR - taxableValue;
  const cgst = Math.round((tax / 2) * 100) / 100;
  const sgst = Math.round((tax / 2) * 100) / 100;

  return {
    invoiceNumber,
    sacCode: '999312',
    taxableValue,
    cgst,
    sgst,
    totalINR: amountINR,
    therapistGSTIN: therapistGSTIN || '27AABCT3521Q1Z8'
  };
};
