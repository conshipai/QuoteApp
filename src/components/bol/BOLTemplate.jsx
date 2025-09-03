// src/components/bol/BOLTemplate.jsx
import React from 'react';

const BOLTemplate = ({ bolData = {}, booking = {} }) => {
  // ───────────────────────────────────────────────────────────
  // Extract data safely with defaults
  // ───────────────────────────────────────────────────────────
  const { 
    bolNumber, 
    shipper, 
    consignee, 
    items = [], 
    specialInstructions,
    pickupInstructions,
    deliveryInstructions,
    referenceNumbers = []
  } = bolData;

  const {
    carrier,
    pickupNumber,
    confirmationNumber,
    quoteNumber,
    shipmentData,
    accountType,
    price // optional; used only if present
  } = booking;

  // ───────────────────────────────────────────────────────────
  // Carrier phone directory (could be moved to backend later)
  // ───────────────────────────────────────────────────────────
  const carrierPhones = {
    'STG Logistics': '800-637-7335',
    'Southeastern Freight Lines': '800-637-7335',
    'YRC Freight': '800-610-6500',
    'FedEx Freight': '800-463-3339',
    'UPS Freight': '800-333-7400',
    'XPO Logistics': '844-742-5976',
    'Old Dominion': '800-235-5569',
    'Estes Express': '866-378-3748'
  };
  const carrierPhone = carrierPhones[carrier] || '800-XXX-XXXX';

  // ───────────────────────────────────────────────────────────
  // Billing party based on account type
  // ───────────────────────────────────────────────────────────
  const isCustomerAccount = accountType === 'customer';
  const billingParty = isCustomerAccount
    ? {
        name: shipper?.name || 'Customer Account',
        address: shipper?.address || '',
        city: shipper?.city || '',
        state: shipper?.state || '',
        zip: shipper?.zip || '',
        phone: shipper?.phone || ''
      }
    : {
        name: 'Conship AI',
        address: 'PO Box 5810',
        city: 'Humble',
        state: 'TX',
        zip: '77396',
        phone: '(833) 266-7447'
      };

  // ───────────────────────────────────────────────────────────
  // References & totals
  // ───────────────────────────────────────────────────────────
  const validReferences = Array.isArray(referenceNumbers)
    ? referenceNumbers.filter(r => r?.value && String(r.value).trim() !== '')
    : [];

  const totalWeight = items.reduce((sum, item) => sum + (parseInt(item?.weight, 10) || 0), 0);
  const totalPieces = items.reduce((sum, item) => sum + (parseInt(item?.quantity, 10) || 0), 0);
  const anyHazmat = items.some(i => !!i?.hazmat);

  // ───────────────────────────────────────────────────────────
  // Notes
  // ───────────────────────────────────────────────────────────
  const allNotes = [
    specialInstructions,
    pickupInstructions && `Pickup: ${pickupInstructions}`,
    deliveryInstructions && `Delivery: ${deliveryInstructions}`
  ].filter(Boolean).join(' || ');

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────
  return (
    <div
      id="bol-template"
      className="w-[8.5in] min-h-[11in] max-h-[11in] bg-white text-black p-4"
      style={{ 
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        lineHeight: '1.2',
        backgroundColor: 'white',
        color: 'black'
      }}
    >
      {/* Header with Logo and Reference Numbers */}
      <div className="flex justify-between items-start mb-3">
        {/* Left: Logo and Title stacked */}
        <div className="flex flex-col">
          <div className="mb-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-4 py-2 rounded"
              style={{ maxWidth: '200px' }}
            >
              <div className="text-2xl font-bold tracking-wider">CONSHIP</div>
              <div className="text-[8px] tracking-widest">FREIGHT INTELLIGENCE</div>
            </div>
          </div>
          <h1 className="text-xl font-bold">Bill Of Lading</h1>
        </div>

        {/* Right: Reference Numbers Table */}
        <div className="border border-black" style={{ fontSize: '9px' }}>
          <table>
            <tbody>
              <tr>
                <td className="border-b border-black px-2 py-1 bg-gray-100 font-semibold">Load Number</td>
                <td className="border-b border-black px-2 py-1">{confirmationNumber || ''}</td>
              </tr>
              <tr>
                <td className="border-b border-black px-2 py-1 bg-gray-100 font-semibold">BOL Number</td>
                <td className="border-b border-black px-2 py-1">{bolNumber || ''}</td>
              </tr>
              <tr>
                <td className="border-b border-black px-2 py-1 bg-gray-100 font-semibold">Ship Date</td>
                <td className="border-b border-black px-2 py-1">{shipmentData?.formData?.pickupDate || ''}</td>
              </tr>

              {/* Display all reference numbers */}
              {validReferences.map((ref, idx) => (
                <tr key={idx}>
                  <td className="border-b border-black px-2 py-1 bg-gray-100 font-semibold">
                    {ref.type === 'Custom' ? (ref.customLabel || 'Reference') : (ref.type || 'Reference')}
                  </td>
                  <td className="border-b border-black px-2 py-1">{ref.value}</td>
                </tr>
              ))}

              <tr>
                <td className="px-2 py-1 bg-gray-100 font-semibold">Freight Charges</td>
                <td className="px-2 py-1">Prepaid</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Parties Section - First Row: Shipper and Consignee */}
      <div className="grid grid-cols-2 gap-0 mb-0">
        {/* Shipper */}
        <div className="border border-black">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black" style={{ fontSize: '10px' }}>
            Shipper
          </div>
          <div className="p-2" style={{ minHeight: '80px', fontSize: '9px' }}>
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
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black" style={{ fontSize: '10px' }}>
            Consignee
          </div>
          <div className="p-2" style={{ minHeight: '80px', fontSize: '9px' }}>
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
      <div className="grid grid-cols-2 gap-0 mb-3">
        {/* 3rd Party Billing */}
        <div className="border border-black border-t-0">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black" style={{ fontSize: '10px' }}>
            3rd Party Billing
          </div>
          <div className="p-2" style={{ minHeight: '70px', fontSize: '9px' }}>
            <div className="font-semibold">{billingParty.name}</div>
            <div>{billingParty.address}</div>
            <div>{billingParty.city}, {billingParty.state}, {billingParty.zip}</div>
            <div>Tel: {billingParty.phone}</div>
          </div>
        </div>

        {/* Transportation Company */}
        <div className="border border-black border-l-0 border-t-0">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black" style={{ fontSize: '10px' }}>
            Transportation Company
          </div>
          <div className="p-2" style={{ minHeight: '70px', fontSize: '9px' }}>
            <div className="font-semibold">{carrier || '_______________________'}</div>
            <div>{pickupNumber ? `Pickup #: ${pickupNumber}` : ''}</div>
            <div>{quoteNumber ? `Quote #: ${quoteNumber}` : ''}</div>
            <div>Tel: {carrierPhone}</div>
          </div>
        </div>
      </div>

      {/* Commodity Table */}
      <div className="mb-3">
        <table className="w-full border-collapse border border-black" style={{ fontSize: '9px' }}>
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-1 py-1 text-left" style={{ width: '8%' }}>
                # of pieces
              </th>
              <th className="border border-black px-1 py-1 text-left" style={{ width: '42%' }}>
                Description of the goods, marks, exceptions
              </th>
              <th className="border border-black px-1 py-1 text-center" style={{ width: '12%' }}>
                Weight in LBS.
              </th>
              <th className="border border-black px-1 py-1 text-center" style={{ width: '8%' }}>
                Type
              </th>
              <th className="border border-black px-1 py-1 text-center" style={{ width: '12%' }}>
                NMFC
              </th>
              <th className="border border-black px-1 py-1 text-center" style={{ width: '8%' }}>
                HM
              </th>
              <th className="border border-black px-1 py-1 text-center" style={{ width: '10%' }}>
                Class
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              // Empty rows for manual entry
              [...Array(4)].map((_, idx) => (
                <tr key={idx} style={{ height: '20px' }}>
                  <td className="border border-black px-1 py-1">&nbsp;</td>
                  <td className="border border-black px-1 py-1">&nbsp;</td>
                  <td className="border border-black px-1 py-1 text-center">&nbsp;</td>
                  <td className="border border-black px-1 py-1 text-center">&nbsp;</td>
                  <td className="border border-black px-1 py-1 text-center">&nbsp;</td>
                  <td className="border border-black px-1 py-1 text-center">&nbsp;</td>
                  <td className="border border-black px-1 py-1 text-center">&nbsp;</td>
                </tr>
              ))
            ) : (
              <>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-black px-1 py-1 text-center">{item?.quantity}</td>
                    <td className="border border-black px-1 py-1">
                      {item?.description || 'General Freight'}
                      {(item?.length && item?.width && item?.height)
                        ? ` ${item?.quantity}@ ${item?.length}*${item?.width}*${item?.height}`
                        : ''}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">{item?.weight}</td>
                    <td className="border border-black px-1 py-1 text-center">
                      {item?.unitType === 'Pallets' ? 'PLT' : item?.unitType}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">{item?.nmfc || ''}</td>
                    <td className="border border-black px-1 py-1 text-center">
                      {item?.hazmat ? 'X' : ''}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">{item?.class}</td>
                  </tr>
                ))}
                {/* Add empty rows to fill space */}
                {items.length < 4 && [...Array(4 - items.length)].map((_, idx) => (
                  <tr key={`empty-${idx}`} style={{ height: '20px' }}>
                    <td className="border border-black px-1 py-1">&nbsp;</td>
                    <td className="border border-black px-1 py-1">&nbsp;</td>
                    <td className="border border-black px-1 py-1">&nbsp;</td>
                    <td className="border border-black px-1 py-1">&nbsp;</td>
                    <td className="border border-black px-1 py-1">&nbsp;</td>
                    <td className="border border-black px-1 py-1">&nbsp;</td>
                    <td className="border border-black px-1 py-1">&nbsp;</td>
                  </tr>
                ))}
              </>
            )}
            
            {/* Totals Row */}
            <tr>
              <td className="border border-black px-1 py-1 font-semibold">
                Total Pieces<br />{totalPieces}
              </td>
              <td className="border border-black px-1 py-1" colSpan={1}></td>
              <td className="border border-black px-1 py-1 text-center font-semibold" colSpan={2}>
                Total Weight<br />{totalWeight} LBS.
              </td>
              <td className="border border-black px-1 py-1 text-center" colSpan={3} style={{ fontSize: '8px' }}>
                Emergency Response Phone<br />
                {anyHazmat ? '1-800-424-9300' : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes and C.O.D. Section */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Left: Notes */}
        <div className="border border-black p-2" style={{ minHeight: '60px' }}>
          <div className="font-semibold mb-1" style={{ fontSize: '9px' }}>Notes:</div>
          <div style={{ fontSize: '8px' }}>{allNotes || ''}</div>
          {bolNumber && <div style={{ fontSize: '8px' }} className="mt-1">BOL #: {bolNumber}</div>}
        </div>

        {/* Right: C.O.D. Information */}
        <div className="border border-black">
          <div className="border-b border-black px-2 py-1" style={{ fontSize: '9px' }}>
            C.O.D. Amount: $0.00
          </div>
          <div className="border-b border-black px-2 py-1" style={{ fontSize: '9px' }}>
            C.O.D. Fee: Prepaid
          </div>
          {/* Optional declared value if price provided */}
          {typeof price === 'number' && (
            <div className="px-2 py-1" style={{ fontSize: '9px' }}>
              Declared Value: ${price.toFixed(2)}
            </div>
          )}
          <div className="px-2 py-2 text-center" style={{ fontSize: '8px', marginTop: '10px' }}>
            If at consignor's risk, write or stamp here
          </div>
        </div>
      </div>

      {/* Signature Section - Simplified */}
      <div className="border border-black">
        <table className="w-full" style={{ fontSize: '9px' }}>
          <tbody>
            {/* First Row - Shipper and Carrier */}
            <tr>
              <td className="border-r border-b border-black px-2 py-2" style={{ width: '25%', height: '60px', verticalAlign: 'top' }}>
                <div className="font-semibold">Shipper</div>
              </td>
              <td className="border-r border-b border-black px-2 py-2" style={{ width: '25%', height: '60px', verticalAlign: 'top' }}>
                <div className="font-semibold">Carrier</div>
              </td>
              <td className="border-r border-b border-black px-2 py-2" style={{ width: '15%', height: '60px', verticalAlign: 'top' }}>
                <div className="font-semibold">Date</div>
                <div className="mt-4">Time</div>
              </td>
              <td className="border-b border-black px-2 py-2" style={{ width: '35%', height: '60px', verticalAlign: 'top' }}>
                <div className="font-semibold text-center">Number Of Pieces Received</div>
              </td>
            </tr>
            
            {/* Second Row - Consignee */}
            <tr>
              <td className="border-r border-black px-2 py-2" style={{ width: '25%', height: '60px', verticalAlign: 'top' }}>
                <div className="font-semibold">Consignee Name</div>
              </td>
              <td className="border-r border-black px-2 py-2" style={{ width: '25%', height: '60px', verticalAlign: 'top' }}>
                <div className="font-semibold">Date</div>
              </td>
              <td className="border-r border-black px-2 py-2" style={{ width: '15%', height: '60px', verticalAlign: 'top' }}>
                <div className="font-semibold">Signature</div>
              </td>
              <td className="px-2 py-2" style={{ width: '35%', height: '60px', verticalAlign: 'top' }}>
                <div className="font-semibold text-center">Number Of Pieces Received</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-2 text-center" style={{ fontSize: '8px', color: '#666' }}>
        Page 1 of 1
      </div>
    </div>
  );
};

export default BOLTemplate;
