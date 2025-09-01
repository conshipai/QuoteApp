// src/components/bol/BOLPreview.jsx
import React, { forwardRef } from 'react';

const Label = ({ title, value }) => (
  <div className="mb-1">
    <div className="text-[10px] uppercase tracking-wider text-gray-500">{title}</div>
    <div className="text-sm font-semibold text-gray-900">{value || '—'}</div>
  </div>
);

const BOLPreview = forwardRef(({ booking, bolData }, ref) => {
  const { confirmationNumber, pickupNumber, carrier, shipmentData } = booking || {};
  const formData = shipmentData?.formData || {};
  const items = bolData?.items || [];

  return (
    <div ref={ref} id="bol-preview" className="w-[816px] min-h-[1056px] bg-white text-gray-900 p-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-3">
        <div>
          <div className="text-2xl font-bold">Bill of Lading</div>
          <div className="text-sm text-gray-600">Standard Straight BOL</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Confirmation #</div>
          <div className="font-semibold">{confirmationNumber}</div>
          <div className="text-xs text-gray-500 mt-1">Pickup #</div>
          <div className="font-semibold">{pickupNumber}</div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-6 mt-4">
        <div className="border rounded p-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Shipper</div>
          <Label title="Company" value={bolData?.shipper?.name} />
          <Label title="Address" value={bolData?.shipper?.address} />
          <Label title="City/State/ZIP" value={`${bolData?.shipper?.city || ''}, ${bolData?.shipper?.state || ''} ${bolData?.shipper?.zip || ''}`} />
          <Label title="Phone" value={bolData?.shipper?.phone} />
          <Label title="Contact" value={bolData?.shipper?.contact} />
        </div>
        <div className="border rounded p-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Consignee</div>
          <Label title="Company" value={bolData?.consignee?.name} />
          <Label title="Address" value={bolData?.consignee?.address} />
          <Label title="City/State/ZIP" value={`${bolData?.consignee?.city || ''}, ${bolData?.consignee?.state || ''} ${bolData?.consignee?.zip || ''}`} />
          <Label title="Phone" value={bolData?.consignee?.phone} />
          <Label title="Contact" value={bolData?.consignee?.contact} />
        </div>
      </div>

      {/* Carrier & References */}
      <div className="grid grid-cols-3 gap-6 mt-4">
        <div className="border rounded p-3">
          <Label title="Carrier" value={carrier || '—'} />
          <Label title="Service" value={formData?.serviceType?.toUpperCase() || '—'} />
          <Label title="Pickup Date" value={formData?.pickupDate || '—'} />
        </div>
        <div className="border rounded p-3">
          <Label title="PO Number" value={bolData?.poNumber} />
          <Label title="Reference 1" value={bolData?.referenceNumbers?.[0]} />
          <Label title="Reference 2" value={bolData?.referenceNumbers?.[1]} />
        </div>
        <div className="border rounded p-3">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Special Instructions</div>
          <div className="text-sm min-h-[72px] whitespace-pre-wrap">{bolData?.specialInstructions || '—'}</div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-4">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Qty</th>
              <th className="border px-2 py-1 text-left">Unit</th>
              <th className="border px-2 py-1 text-left">Description</th>
              <th className="border px-2 py-1 text-left">Class</th>
              <th className="border px-2 py-1 text-left">Weight (lbs)</th>
              <th className="border px-2 py-1 text-left">Hazmat</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="border px-2 py-3 text-center text-gray-500">No line items</td>
              </tr>
            )}
            {items.map((item, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{item.quantity}</td>
                <td className="border px-2 py-1">{item.unitType}</td>
                <td className="border px-2 py-1">{item.description || 'General Freight'}</td>
                <td className="border px-2 py-1">{item.class || '—'}</td>
                <td className="border px-2 py-1">{item.weight}</td>
                <td className="border px-2 py-1">{item.hazmat ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 text-[10px] text-gray-500 text-center">
        Generated by Conship Command Center • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
});

BOLPreview.displayName = 'BOLPreview';

export default BOLPreview;
