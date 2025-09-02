// src/components/bol/BOLTemplate.jsx
import React from 'react';
// Try different import paths if logo doesn't load
import conshipLogo from '../../assets/images/conship-logo.png';
// If that doesn't work in your build setup, try a public path instead:
// const conshipLogo = '/images/conship-logo.png';

const BOLTemplate = ({ bolData, booking }) => {
  // Extract data
  const { 
    bolNumber, 
    shipper, 
    consignee, 
    items = [], 
    specialInstructions,
    poNumber
  } = bolData || {};

  const {
    carrier,
    pickupNumber,
    confirmationNumber,
    quoteNumber,
    shipmentData
  } = booking || {};

  // Determine billing party based on account type
  const isCustomerAccount = booking?.accountType === 'customer';
  const billingParty = isCustomerAccount
    ? {
        name: shipper?.name || 'Customer Account',
        address: shipper?.address,
        city: shipper?.city,
        state: shipper?.state,
        zip: shipper?.zip
      }
    : {
        name: 'Conship AI',
        address: '5810 Wilson Rd, Ste 210',
        city: 'Humble',
        state: 'TX',
        zip: '77396'
      };

  return (
    <>
      {/* Disclaimer Banner (hidden on print) */}
      <div className="bg-yellow-100 border-2 border-yellow-400 p-4 mb-4 print:hidden">
        <h3 className="font-bold text-yellow-800 mb-2">⚠️ IMPORTANT NOTICE</h3>
        <p className="text-sm text-yellow-700">
          This is a booking utility only. By using this Bill of Lading, you agree to the terms and conditions of the selected carrier.
          Conship AI has no control over reweights, reclassifications, performance, damages, or any other carrier-related issues.
          All shipments are subject to the carrier&apos;s rules tariff and terms of service.
        </p>
      </div>

      {/* BOL Document - Always white background for printing */}
      <div
        id="bol-template"
        className="w-[8.5in] min-h-[11in] bg-white text-black p-8 print:p-4"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header with Logo */}
        <div className="border-b-2 border-black pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              {/* Image logo with fallback to text logo */}
              {conshipLogo ? (
                <img
                  src={conshipLogo}
                  alt="Conship AI"
                  className="h-16 w-auto"
                  style={{ maxWidth: '200px' }}
                  onError={(e) => {
                    // Hide image and show fallback text block
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
              ) : null}

              {/* Fallback text logo (hidden if image loads) */}
              <div style={{ display: conshipLogo ? 'none' : 'block' }}>
                <div className="text-3xl font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
                  CONSHIP AI
                </div>
                <div className="text-sm text-gray-600 mt-1">Freight Intelligence Platform</div>
              </div>
            </div>

            {/* Right side BOL heading */}
            <div className="text-right">
              <h1 className="text-2xl font-bold">BILL OF LADING</h1>
              <div className="text-sm mt-2 space-y-1">
                <div><span className="font-semibold">BOL #:</span> {bolNumber || 'PENDING'}</div>
                <div><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Numbers */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-100">
          <div>
            <span className="text-xs font-semibold">BOOKING #</span>
            <div className="font-bold">{confirmationNumber || 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs font-semibold">CARRIER QUOTE #</span>
            <div className="font-bold">{quoteNumber || pickupNumber || 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs font-semibold">PO NUMBER</span>
            <div className="font-bold">{poNumber || 'N/A'}</div>
          </div>
        </div>

        {/* Parties Section */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Shipper */}
          <div className="border border-gray-400 p-3">
            <div className="bg-gray-200 -m-3 mb-2 p-2 font-bold text-sm">SHIPPER</div>
            <div className="space-y-1 text-sm">
              <div className="font-semibold">{shipper?.name || 'N/A'}</div>
              <div>{shipper?.address || 'N/A'}</div>
              <div>{shipper?.city}, {shipper?.state} {shipper?.zip}</div>
              <div>Phone: {shipper?.phone || 'N/A'}</div>
              <div>Contact: {shipper?.contact || 'N/A'}</div>
            </div>
          </div>

          {/* Consignee */}
          <div className="border border-gray-400 p-3">
            <div className="bg-gray-200 -m-3 mb-2 p-2 font-bold text-sm">CONSIGNEE</div>
            <div className="space-y-1 text-sm">
              <div className="font-semibold">{consignee?.name || 'N/A'}</div>
              <div>{consignee?.address || 'N/A'}</div>
              <div>{consignee?.city}, {consignee?.state} {consignee?.zip}</div>
              <div>Phone: {consignee?.phone || 'N/A'}</div>
              <div>Contact: {consignee?.contact || 'N/A'}</div>
            </div>
          </div>

          {/* 3rd Party Billing */}
          <div className="border border-gray-400 p-3">
            <div className="bg-gray-200 -m-3 mb-2 p-2 font-bold text-sm">3RD PARTY BILLING</div>
            <div className="space-y-1 text-sm">
              <div className="font-semibold">{billingParty.name}</div>
              <div>{billingParty.address}</div>
              <div>{billingParty.city}, {billingParty.state} {billingParty.zip}</div>
              <div className="mt-2">
                <input type="checkbox" checked readOnly /> Third Party
                <input type="checkbox" className="ml-4" disabled /> Prepaid
                <input type="checkbox" className="ml-4" disabled /> Collect
              </div>
            </div>
          </div>
        </div>

        {/* Carrier Information */}
        <div className="border border-gray-400 p-3 mb-4">
          <div className="bg-gray-200 -m-3 mb-2 p-2 font-bold text-sm">CARRIER INFORMATION</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold">Carrier:</span> {carrier || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Pickup Date:</span> {shipmentData?.formData?.pickupDate || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Service:</span> {shipmentData?.serviceType?.toUpperCase() || 'LTL'}
            </div>
          </div>
        </div>

        {/* Commodity Table */}
        <div className="mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2 text-xs text-left">QTY</th>
                <th className="border border-gray-400 p-2 text-xs text-left">TYPE</th>
                <th className="border border-gray-400 p-2 text-xs text-left">DESCRIPTION</th>
                <th className="border border-gray-400 p-2 text-xs text-center">WEIGHT (LBS)</th>
                <th className="border border-gray-400 p-2 text-xs text-center">CLASS</th>
                <th className="border border-gray-400 p-2 text-xs text-center">NMFC</th>
                <th className="border border-gray-400 p-2 text-xs text-center">HM</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="border border-gray-400 p-4 text-center text-gray-500">
                    No commodity items
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-400 p-2 text-sm">{item.quantity || 1}</td>
                    <td className="border border-gray-400 p-2 text-sm">{item.unitType || 'Pallets'}</td>
                    <td className="border border-gray-400 p-2 text-sm">{item.description || 'General Freight'}</td>
                    <td className="border border-gray-400 p-2 text-sm text-center">{item.weight || 0}</td>
                    <td className="border border-gray-400 p-2 text-sm text-center">{item.class || '85'}</td>
                    <td className="border border-gray-400 p-2 text-sm text-center">{item.nmfc || ''}</td>
                    <td className="border border-gray-400 p-2 text-sm text-center">{item.hazmat ? 'X' : ''}</td>
                  </tr>
                ))
              )}
              {/* Totals Row */}
              <tr className="font-bold bg-gray-100">
                <td colSpan="3" className="border border-gray-400 p-2 text-sm text-right">TOTALS:</td>
                <td className="border border-gray-400 p-2 text-sm text-center">
                  {items.reduce((sum, item) => sum + (parseInt(item.weight) || 0), 0)}
                </td>
                <td colSpan="3" className="border border-gray-400 p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Special Instructions */}
        <div className="border border-gray-400 p-3 mb-4">
          <div className="bg-gray-200 -m-3 mb-2 p-2 font-bold text-sm">SPECIAL INSTRUCTIONS</div>
          <div className="text-sm min-h-[60px]">
            {specialInstructions || 'None'}
          </div>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="border-t-2 border-black pt-2">
            <div className="text-xs">SHIPPER SIGNATURE / DATE</div>
          </div>
          <div className="border-t-2 border-black pt-2">
            <div className="text-xs">CARRIER SIGNATURE / DATE</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-600">
          <div>Generated by Conship AI Command Center • {new Date().toLocaleString()}</div>
          <div className="mt-1">This is a legal contract - Please read all terms and conditions</div>
        </div>
      </div>
    </>
  );
};

export default BOLTemplate;
