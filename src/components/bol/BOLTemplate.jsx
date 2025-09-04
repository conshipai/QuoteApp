// src/components/bol/BOLTemplate.jsx
import React from 'react';
import logo from '../../assets/images/logo.png'; 

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
    shipmentData
  } = booking || {};

  // Carrier phone database (in production, this would come from your backend)
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

  // Get ALL reference numbers
  const validReferences = referenceNumbers.filter(r => r.value && r.value.trim() !== '');

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
      className="w-[8.5in] min-h-[11in] max-h-[11in] bg-white text-black p-4"
      style={{ 
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',  // INCREASED from 10px to 14px
        lineHeight: '1.3',  // Slightly increased line height
        backgroundColor: 'white !important',
        color: 'black !important'
      }}
    >
      {/* Header with Logo and Reference Numbers */}
      <div className="flex justify-between items-start mb-3">
        {/* Left: Logo and Title stacked */}
        <div className="flex flex-col">
          {/* Logo - Recommended size: 200px x 60px for landscape logo */}
          <div className="mb-2">
           <img 
              src={logo} 
              alt="Company Logo"
              style={{ maxWidth: '240px', height: 'auto', maxHeight: '70px' }}  // Slightly bigger logo
            />
          </div>
          
          {/* Title below logo */}
          <h1 className="text-2xl font-bold">Bill Of Lading</h1>  {/* Increased from text-xl to text-2xl */}
        </div>

        {/* Right: Reference Numbers Table */}
        <div className="border border-black" style={{ fontSize: '12px' }}>  {/* INCREASED from 9px to 12px */}
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
              {/* Display ALL reference numbers */}
              {validReferences.map((ref, idx) => (
                <tr key={idx}>
                  <td className="border-b border-black px-2 py-1 bg-gray-100 font-semibold">
                    {ref.type === 'Custom' ? (ref.customLabel || 'Reference') : ref.type}
                  </td>
                  <td className="border-b border-black px-2 py-1">{ref.value}</td>
                </tr>
              ))}
              <tr>
                <td className="px-2 py-1 bg-gray-100 font-semibold">Freight Charges</td>
                <td className="px-2 py-1">3rd Party</td>  {/* CHANGED from Prepaid to 3rd Party */}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Parties Section - First Row: Shipper and Consignee */}
      <div className="grid grid-cols-2 gap-0 mb-0">
        {/* Shipper */}
        <div className="border border-black">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black" style={{ fontSize: '13px' }}>  {/* INCREASED from 10px to 13px */}
            Shipper
          </div>
          <div className="p-2" style={{ minHeight: '90px', fontSize: '12px' }}>  {/* INCREASED from 9px to 12px */}
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
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black" style={{ fontSize: '13px' }}>  {/* INCREASED from 10px to 13px */}
            Consignee
          </div>
          <div className="p-2" style={{ minHeight: '90px', fontSize: '12px' }}>  {/* INCREASED from 9px to 12px */}
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
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black" style={{ fontSize: '13px' }}>  {/* INCREASED from 10px to 13px */}
            3rd Party Billing
          </div>
          <div className="p-2" style={{ minHeight: '80px', fontSize: '12px' }}>  {/* INCREASED from 9px to 12px */}
            <div className="font-semibold">{billingParty.name}</div>
            <div>{billingParty.address}</div>
            <div>{billingParty.city}, {billingParty.state}, {billingParty.zip}</div>
            <div>Tel: {billingParty.phone}</div>
          </div>
        </div>

        {/* Transportation Company */}
        <div className="border border-black border-l-0 border-t-0">
          <div className="bg-gray-200 px-2 py-1 font-semibold border-b border-black" style={{ fontSize: '13px' }}>  {/* INCREASED from 10px to 13px */}
            Transportation Company
          </div>
          <div className="p-2" style={{ minHeight: '80px', fontSize: '12px' }}>  {/* INCREASED from 9px to 12px */}
            <div className="font-semibold">{carrier || '_______________________'}</div>
            <div>{pickupNumber ? `Pickup #: ${pickupNumber}` : ''}</div>
            <div>{quoteNumber ? `Quote #: ${quoteNumber}` : ''}</div>
            <div>Tel: {carrierPhone}</div>
          </div>
        </div>
      </div>

      {/* Commodity Table */}
      <div className="mb-3">
        <table className="w-full border-collapse border border-black" style={{ fontSize: '11px' }}>  {/* INCREASED from 9px to 11px */}
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
                <tr key={idx} style={{ height: '24px' }}>  {/* Increased height */}
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
                    <td className="border border-black px-1 py-1 text-center">{item.quantity}</td>
                    <td className="border border-black px-1 py-1">
                      {item.description || 'General Freight'}
                      {item.length && item.width && item.height && 
                        ` ${item.quantity}@ ${item.length}*${item.width}*${item.height}`
                      }
                    </td>
                    <td className="border border-black px-1 py-1 text-center">{item.weight}</td>
                    <td className="border border-black px-1 py-1 text-center">
                      {item.unitType === 'Pallets' ? 'PLT' : item.unitType}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">{item.nmfc || ''}</td>
                    <td className="border border-black px-1 py-1 text-center">
                      {item.hazmat ? 'X' : ''}
                    </td>
                    <td className="border border-black px-1 py-1 text-center">{item.class}</td>
                  </tr>
                ))}
                {/* Add empty rows to fill space */}
                {items.length < 4 && [...Array(4 - items.length)].map((_, idx) => (
                  <tr key={`empty-${idx}`} style={{ height: '24px' }}>  {/* Increased height */}
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
  <td className="border border-black px-1 py-1" colSpan="1"></td>
  <td className="border border-black px-1 py-1 text-center font-semibold" colSpan="2">
    Total Weight<br />{totalWeight} LBS.
  </td>
  <td className="border border-black px-1 py-1 text-center" colSpan="3" style={{ fontSize: '10px' }}>
    Emergency Response Phone<br />
    {items.some(i => i.hazmat) ? (
      // Get the first emergency phone number from hazmat items, or use default
      items.find(i => i.hazmat && i.hazmatDetails?.emergencyPhone)?.hazmatDetails?.emergencyPhone || '1-800-424-9300'
    ) : ''}
  </td>
</tr>
          </tbody>
        </table>
         {/* Hazmat Details Section - Only show if any items are hazmat */}
            {items.some(item => item.hazmat) && (
        <div className="mt-3 border border-black p-2" style={{ fontSize: '11px' }}>
          <div className="font-bold mb-1" style={{ fontSize: '12px' }}>
            HAZARDOUS MATERIALS
          </div>
          {items.filter(item => item.hazmat).map((item, idx) => (
            <div key={idx} className="mb-1">
              <span style={{ fontWeight: 'bold' }}>
                {/* Format: UN#, Proper Shipping Name, Class, PG (if not N/A) */}
                {item.hazmatDetails?.unNumber || 'UN____'}, {item.hazmatDetails?.properShippingName || 'Not Specified'}, {item.hazmatDetails?.hazardClass || '_'}{item.hazmatDetails?.packingGroup && item.hazmatDetails.packingGroup !== 'N/A' ? `, ${item.hazmatDetails.packingGroup}` : ''}
              </span>
              {' - '}
              <span>{item.weight} lbs</span>
            </div>
          ))}
        </div>
      )}
        {/* Hazmat Shipper Certification - Only show if any items are hazmat */}
      {items.some(item => item.hazmat) && (
        <div className="mt-3 border-2 border-black p-3" style={{ fontSize: '11px' }}>
          <div className="font-bold mb-2" style={{ fontSize: '12px' }}>
            HAZARDOUS MATERIALS SHIPPER'S CERTIFICATION
          </div>
          <p className="mb-2">
            This is to certify that the above-named materials are properly classified, described, 
            packaged, marked, and labeled, and are in proper condition for transportation according 
            to the applicable regulations of the Department of Transportation.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <div className="font-semibold mb-1">Shipper Name (Print)</div>
              <div style={{ borderBottom: '1px solid black', height: '25px' }}></div>
            </div>
            <div>
              <div className="font-semibold mb-1">Signature</div>
              <div style={{ borderBottom: '1px solid black', height: '25px' }}></div>
            </div>
            <div>
              <div className="font-semibold mb-1">Date</div>
              <div style={{ borderBottom: '1px solid black', height: '25px' }}></div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Notes and C.O.D. Section */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Left: Notes */}
        <div className="border border-black p-2" style={{ minHeight: '70px' }}>
          <div className="font-semibold mb-1" style={{ fontSize: '12px' }}>Notes:</div>  {/* INCREASED from 9px to 12px */}
          <div style={{ fontSize: '11px' }}>{allNotes || ''}</div>  {/* INCREASED from 8px to 11px */}
          {bolNumber && <div style={{ fontSize: '11px' }} className="mt-1">BOL #: {bolNumber}</div>}
        </div>

        {/* Right: C.O.D. Information (NO Declared Value) */}
        <div className="border border-black">
          <div className="border-b border-black px-2 py-1" style={{ fontSize: '12px' }}>  {/* INCREASED from 9px to 12px */}
            C.O.D. Amount: $0.00
          </div>
          <div className="border-b border-black px-2 py-1" style={{ fontSize: '12px' }}>  {/* INCREASED from 9px to 12px */}
            C.O.D. Fee: 3rd Party  {/* CHANGED from Prepaid to 3rd Party */}
          </div>
          <div className="px-2 py-2 text-center" style={{ fontSize: '10px', marginTop: '10px' }}>  {/* INCREASED from 8px to 10px */}
            If at consignor's risk, write or stamp here
          </div>
        </div>
      </div>

      {/* IMPROVED Signature Section */}
      <div className="border border-black">
        <table className="w-full" style={{ fontSize: '11px' }}>  {/* INCREASED from 9px to 11px */}
          <tbody>
            {/* First Row - Shipper and Carrier */}
            <tr>
              <td className="border-r border-b border-black px-2 py-2" style={{ width: '35%', height: '70px', verticalAlign: 'top' }}>  {/* INCREASED width from 25% to 35% */}
                <div className="font-semibold mb-1">Shipper Signature</div>
                <div style={{ borderBottom: '1px solid #999', marginTop: '35px', width: '90%' }}></div>
              </td>
              <td className="border-r border-b border-black px-2 py-2" style={{ width: '35%', height: '70px', verticalAlign: 'top' }}>  {/* INCREASED width from 25% to 35% */}
                <div className="font-semibold mb-1">Carrier Signature</div>
                <div style={{ borderBottom: '1px solid #999', marginTop: '35px', width: '90%' }}></div>
              </td>
              <td className="border-r border-b border-black px-2 py-2" style={{ width: '15%', height: '70px', verticalAlign: 'top' }}>
                <div className="font-semibold">Date</div>
                <div style={{ borderBottom: '1px solid #999', marginTop: '15px', width: '90%' }}></div>
                <div className="mt-2">Time</div>
                <div style={{ borderBottom: '1px solid #999', marginTop: '10px', width: '90%' }}></div>
              </td>
              <td className="border-b border-black px-2 py-2 text-center" style={{ width: '15%', height: '70px', verticalAlign: 'middle' }}>  {/* DECREASED width from 35% to 15% */}
                <div className="font-semibold" style={{ fontSize: '10px' }}>Pieces<br/>Received</div>
                <div style={{ border: '1px solid #999', width: '50px', height: '25px', margin: '5px auto' }}></div>
              </td>
            </tr>
            
            {/* Second Row - Consignee */}
            <tr>
              <td className="border-r border-black px-2 py-2" style={{ width: '35%', height: '70px', verticalAlign: 'top' }}>  {/* INCREASED width */}
                <div className="font-semibold mb-1">Consignee Name (Print)</div>
                <div style={{ borderBottom: '1px solid #999', marginTop: '35px', width: '90%' }}></div>
              </td>
              <td className="border-r border-black px-2 py-2" style={{ width: '35%', height: '70px', verticalAlign: 'top' }}>  {/* This becomes the signature box */}
                <div className="font-semibold mb-1">Consignee Signature</div>
                <div style={{ borderBottom: '1px solid #999', marginTop: '35px', width: '90%' }}></div>
              </td>
              <td className="border-r border-black px-2 py-2" style={{ width: '15%', height: '70px', verticalAlign: 'top' }}>
                <div className="font-semibold">Date</div>
                <div style={{ borderBottom: '1px solid #999', marginTop: '15px', width: '90%' }}></div>
                <div className="mt-2">Time</div>
                <div style={{ borderBottom: '1px solid #999', marginTop: '10px', width: '90%' }}></div>
              </td>
              <td className="px-2 py-2 text-center" style={{ width: '15%', height: '70px', verticalAlign: 'middle' }}>  {/* DECREASED width */}
                <div className="font-semibold" style={{ fontSize: '10px' }}>Pieces<br/>Received</div>
                <div style={{ border: '1px solid #999', width: '50px', height: '25px', margin: '5px auto' }}></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-2 text-center" style={{ fontSize: '10px', color: '#666' }}>  {/* INCREASED from 8px to 10px */}
        Page 1 of 1
      </div>
    </div>
  );
};

export default BOLTemplate;
