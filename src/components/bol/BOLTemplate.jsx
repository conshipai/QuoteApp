// src/components/bol/BOLTemplate.jsx
import React from 'react';

const BOLTemplate = ({ bolData, booking }) => {
  // Extract data
  const { 
    bolNumber, 
    shipper, 
    consignee, 
    items = [], 
    specialInstructions,
    pickupInstructions,
    deliveryInstructions,
    referenceNumbers = []
  } = bolData || {};

  const {
    carrier,
    pickupNumber,
    confirmationNumber,
    quoteNumber,
    shipmentData,
    price
  } = booking || {};

  // Determine billing party based on account type
  const isCustomerAccount = booking?.accountType === 'customer';
  const billingParty = isCustomerAccount
    ? {
        name: shipper?.name || 'Customer Account',
        address: shipper?.address,
        city: shipper?.city,
        state: shipper?.state,
        zip: shipper?.zip,
        phone: shipper?.phone
      }
    : {
        name: 'Conship AI',
        address: 'PO Box 5810',
        city: 'Humble',
        state: 'TX',
        zip: '77396',
        phone: '(833) 266-7447'
      };

  // Get reference numbers
  const poNumber = referenceNumbers.find(r => r.type === 'PO Number')?.value || '';
  const soNumber = referenceNumbers.find(r => r.type === 'SO Number')?.value || '';
  const woNumber = referenceNumbers.find(r => r.type === 'Work Order')?.value || '';

  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => sum + (parseInt(item.weight) || 0), 0);
  const totalPieces = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  // Combine all instructions
  const allNotes = [
    specialInstructions,
    pickupInstructions && `Pickup: ${pickupInstructions}`,
    deliveryInstructions && `Delivery: ${deliveryInstructions}`
  ].filter(Boolean).join(' || ');

  return (
    <div
      id="bol-template"
      className="w-[8.5in] min-h-[11in] bg-white text-black p-6"
      style={{ 
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        lineHeight: '1.3'
      }}
    >
      {/* Header with Logo and Reference Numbers */}
      <div className="flex justify-between items-start mb-4">
        {/* Left: Logo and Title */}
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-3xl font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
              CONSHIP
            </div>
            <div className="text-xs text-gray-600">Freight Intelligence</div>
          </div>
          
          {/* Title */}
          <div className="mt-2">
            <h1 className="text-2xl font-bold">Bill Of Lading</h1>
          </div>
        </div>

        {/* Right: Reference Numbers Table */}
        <div className="border border-black">
          <table className="text-sm">
            <tbody>
              <tr>
                <td className="border-b border-black px-3 py-1 bg-gray-100 font-semibold">Load Number</td>
                <td className="border-b border-black px-3 py-1">{confirmationNumber || ''}</td>
              </tr>
              <tr>
                <td className="border-b border-black px-3 py-1 bg-gray-100 font-semibold">BOL Number</td>
                <td className="border-b border-black px-3 py-1">{bolNumber || ''}</td>
              </tr>
              <tr>
                <td className="border-b border-black px-3 py-1 bg-gray-100 font-semibold">Ship Date</td>
                <td className="border-b border-black px-3 py-1">{shipmentData?.formData?.pickupDate || ''}</td>
              </tr>
              <tr>
                <td className="border-b border-black px-3 py-1 bg-gray-100 font-semibold">Delivery Date</td>
                <td className="border-b border-black px-3 py-1">{/* Calculate based on transit days */}</td>
              </tr>
              <tr>
                <td className="border-b border-black px-3 py-1 bg-gray-100 font-semibold">P.O. Number</td>
                <td className="border-b border-black px-3 py-1">{poNumber}</td>
              </tr>
              <tr>
                <td className="px-3 py-1 bg-gray-100 font-semibold">Freight Charges</td>
                <td className="px-3 py-1">Prepaid</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Parties Section - First Row: Shipper and Consignee */}
      <div className="grid grid-cols-2 gap-0 mb-0">
        {/* Shipper */}
        <div className="border border-black">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black">Shipper</div>
          <div className="p-2" style={{ minHeight: '100px' }}>
            <div className="font-semibold">{shipper?.name || '_______________________'}</div>
            <div>{shipper?.address || '_______________________'}</div>
            <div>
              {shipper?.city || '________'}, {shipper?.state || '__'}, {shipper?.zip || '_____'}
            </div>
            <div>Tel: {shipper?.phone || '_______________'}</div>
            {shipper?.contact && <div>Contact: {shipper.contact}</div>}
          </div>
        </div>

        {/* Consignee */}
        <div className="border border-black border-l-0">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black">Consignee</div>
          <div className="p-2" style={{ minHeight: '100px' }}>
            <div className="font-semibold">{consignee?.name || '_______________________'}</div>
            <div>{consignee?.address || '_______________________'}</div>
            <div>
              {consignee?.city || '________'}, {consignee?.state || '__'}, {consignee?.zip || '_____'}
            </div>
            <div>Tel: {consignee?.phone || '_______________'}</div>
            {consignee?.contact && <div>Contact: {consignee.contact}</div>}
          </div>
        </div>
      </div>

      {/* Second Row: 3rd Party Billing and Transportation Company */}
      <div className="grid grid-cols-2 gap-0 mb-4">
        {/* 3rd Party Billing */}
        <div className="border border-black border-t-0">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black">3rd Party Billing</div>
          <div className="p-2" style={{ minHeight: '80px' }}>
            <div className="font-semibold">{billingParty.name}</div>
            <div>{billingParty.address}</div>
            <div>{billingParty.city}, {billingParty.state}, {billingParty.zip}</div>
            <div>Tel: {billingParty.phone}</div>
          </div>
        </div>

        {/* Transportation Company */}
        <div className="border border-black border-l-0 border-t-0">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black">Transportation Company</div>
          <div className="p-2" style={{ minHeight: '80px' }}>
            <div className="font-semibold">{carrier || '_______________________'}</div>
            <div>{pickupNumber ? `Pickup #: ${pickupNumber}` : ''}</div>
            <div>{quoteNumber ? `Quote #: ${quoteNumber}` : ''}</div>
            <div>Tel: 800-XXX-XXXX</div>
          </div>
        </div>
      </div>

      {/* Commodity Table */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-2 py-1 text-left" style={{ width: '10%' }}>
                # of pieces
              </th>
              <th className="border border-black px-2 py-1 text-left" style={{ width: '40%' }}>
                Description of the goods, marks, exceptions
              </th>
              <th className="border border-black px-2 py-1 text-center" style={{ width: '12%' }}>
                Weight in LBS.
              </th>
              <th className="border border-black px-2 py-1 text-center" style={{ width: '8%' }}>
                Type
              </th>
              <th className="border border-black px-2 py-1 text-center" style={{ width: '12%' }}>
                NMFC
              </th>
              <th className="border border-black px-2 py-1 text-center" style={{ width: '8%' }}>
                HM
              </th>
              <th className="border border-black px-2 py-1 text-center" style={{ width: '10%' }}>
                Class
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              // Empty rows for manual entry
              [...Array(5)].map((_, idx) => (
                <tr key={idx} style={{ height: '25px' }}>
                  <td className="border border-black px-2 py-1">&nbsp;</td>
                  <td className="border border-black px-2 py-1">&nbsp;</td>
                  <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
                  <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
                  <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
                  <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
                  <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
                </tr>
              ))
            ) : (
              <>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-black px-2 py-1 text-center">{item.quantity}</td>
                    <td className="border border-black px-2 py-1">
                      {item.description || 'General Freight'}
                      {item.length && item.width && item.height && 
                        ` ${item.quantity}@ ${item.length}*${item.width}*${item.height}`
                      }
                    </td>
                    <td className="border border-black px-2 py-1 text-center">{item.weight}</td>
                    <td className="border border-black px-2 py-1 text-center">
                      {item.unitType === 'Pallets' ? 'PLT' : item.unitType}
                    </td>
                    <td className="border border-black px-2 py-1 text-center">{item.nmfc || ''}</td>
                    <td className="border border-black px-2 py-1 text-center">
                      {item.hazmat ? 'X' : ''}
                    </td>
                    <td className="border border-black px-2 py-1 text-center">{item.class}</td>
                  </tr>
                ))}
                {/* Add empty rows to fill space */}
                {items.length < 5 && [...Array(5 - items.length)].map((_, idx) => (
                  <tr key={`empty-${idx}`} style={{ height: '25px' }}>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                    <td className="border border-black px-2 py-1">&nbsp;</td>
                  </tr>
                ))}
              </>
            )}
            
            {/* Totals Row */}
            <tr>
              <td className="border border-black px-2 py-1 font-semibold">
                Total Pieces<br />{totalPieces}
              </td>
              <td className="border border-black px-2 py-1" colSpan="1"></td>
              <td className="border border-black px-2 py-1 text-center font-semibold" colSpan="2">
                Total Weight<br />{totalWeight} LBS.
              </td>
              <td className="border border-black px-2 py-1 text-center" colSpan="3">
                Emergency Response Phone<br />
                {/* Emergency phone if hazmat */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes and C.O.D. Section */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Left: Notes */}
        <div className="border border-black p-2" style={{ minHeight: '80px' }}>
          <div className="font-semibold mb-1">Notes:</div>
          <div className="text-xs">{allNotes || ''}</div>
          {bolNumber && <div className="text-xs mt-2">BOL #: {bolNumber}</div>}
        </div>

        {/* Right: C.O.D. Information */}
        <div className="border border-black">
          <div className="border-b border-black px-2 py-1">C.O.D. Amount: $0.00</div>
          <div className="border-b border-black px-2 py-1">C.O.D. Fee: Prepaid</div>
          <div className="px-2 py-1">Declared Value: ${price ? price.toFixed(2) : '0.00'}</div>
          <div className="px-2 py-2 text-xs text-center mt-2">
            If at consignor's risk, write or stamp here
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="border border-black">
        <table className="w-full">
          <tbody>
            {/* First Row - Shipper and Carrier */}
            <tr>
              <td className="border-r border-b border-black px-2 py-2" style={{ width: '25%' }}>
                <div className="font-semibold">Shipper</div>
                <div className="mt-6">Per _________________</div>
              </td>
              <td className="border-r border-b border-black px-2 py-2" style={{ width: '25%' }}>
                <div className="font-semibold">Carrier</div>
                <div className="mt-6">Per _________________</div>
              </td>
              <td className="border-r border-b border-black px-2 py-2" style={{ width: '15%' }}>
                <div className="font-semibold">Date</div>
                <div className="mt-6">___________</div>
                <div className="font-semibold mt-2">Time</div>
                <div>___________</div>
              </td>
              <td className="border-b border-black px-2 py-2" style={{ width: '35%' }}>
                <div className="font-semibold text-center">Number Of Pieces Received</div>
                <div className="mt-8 text-center">_________________</div>
              </td>
            </tr>
            
            {/* Second Row - Consignee */}
            <tr>
              <td className="border-r border-black px-2 py-2" style={{ width: '25%' }}>
                <div className="font-semibold">Consignee Name</div>
                <div className="mt-6">_________________</div>
              </td>
              <td className="border-r border-black px-2 py-2" style={{ width: '25%' }}>
                <div className="font-semibold">Date</div>
                <div className="mt-6">_________________</div>
              </td>
              <td className="border-r border-black px-2 py-2" style={{ width: '15%' }}>
                <div className="font-semibold">Signature</div>
                <div className="mt-6">___________</div>
              </td>
              <td className="px-2 py-2" style={{ width: '35%' }}>
                <div className="font-semibold text-center">Number Of Pieces Received</div>
                <div className="mt-8 text-center">_________________</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-600">
        Page 1 of 1
      </div>
    </div>
  );
};

export default BOLTemplate;
