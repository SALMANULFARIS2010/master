

import React, { useContext, useState, useEffect } from 'react';
import { ItemContext } from './ItemContext';
import * as XLSX from 'xlsx';
import './PurchaseOrder.css';

const suppliersList = ['Supplier A', 'Supplier B', 'Supplier C']; 

const PurchaseOrder = () => {
  const { items } = useContext(ItemContext);
  const [orderQty, setOrderQty] = useState({});
  const [orderNo, setOrderNo] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [packingUnit, setPackingUnit] = useState({}); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(''); 

  useEffect(() => {
    // Auto-generate order number and set current date
    setOrderNo(`PO-${Math.floor(Math.random() * 10000)}`);
    setOrderDate(new Date().toLocaleDateString());
  }, []);

  const handleQtyChange = (e) => {
    const qty = e.target.value > 0 ? e.target.value : 1;
    setOrderQty({ ...orderQty, [selectedItem]: qty });
  };

  const handlePackingUnitChange = (e) => {
    const unit = e.target.value;
    setPackingUnit({ ...packingUnit, [selectedItem]: unit });
  };

  const calculateNetAmount = (itemNo, unitPrice) => {
    return (orderQty[itemNo] || 1) * unitPrice; 
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSupplierSelect = (supplier) => {
    setSupplierName(supplier);
    toggleModal();
  };

  // Export to Excel function
  const exportToExcel = () => {
    if (!supplierName) {
      alert('Please select a supplier before exporting the purchase order.');
      return;
    }

    if (!selectedItem) {
      alert('Please select an item before exporting the purchase order.');
      return;
    }

    const data = items.map(item => ({
      "Item No": item.itemNo,
      "Item Name": item.itemName,
      "Stock Unit": item.stockUnit,
      "Unit Price": item.unitPrice,
      "Packing Unit": packingUnit[item.itemNo] || "box", 
      "Order Qty": orderQty[item.itemNo] || 1,
      "Net Amount": calculateNetAmount(item.itemNo, item.unitPrice)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Order');

    XLSX.writeFile(workbook, `Purchase_Order_${orderNo}.xlsx`);
  };

  // Print Purchase Order function
  const printPurchaseOrder = () => {
    if (!supplierName) {
      alert('Please select a supplier before printing the purchase order.');
      return;
    }

    if (!selectedItem) {
      alert('Please select an item before printing the purchase order.');
      return;
    }

    window.print();
  };

  return (
    <div>
      <h3>Purchase Order</h3>

      {/* Order Info Fields */}
      <div>
        <label>Order No:</label>
        <input type="text" value={orderNo} readOnly />

        <label>Order Date:</label>
        <input type="text" value={orderDate} readOnly />

        <label>Supplier Name:</label>
        <input type="text" value={supplierName} readOnly />
        <button type="button" onClick={toggleModal}>Select Supplier</button>
      </div>

      {/* Supplier Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h4>Select a Supplier</h4>
            <ul>
              {suppliersList.map((supplier, index) => (
                <li key={index} onClick={() => handleSupplierSelect(supplier)}>
                  {supplier}
                </li>
              ))}
            </ul>
            <button onClick={toggleModal}>Close</button>
          </div>
        </div>
      )}

      {/* Display message if no items are added */}
      {items.length === 0 ? (
        <p className="no-items-msg">Please add items to the purchase order.</p>
      ) : (
        <>
          {/* Item Selection Dropdown */}
          <div>
            <label>Select Item:</label>
            <select onChange={(e) => setSelectedItem(e.target.value)} value={selectedItem}>
              <option value="">--Select an Item--</option>
              {items.map(item => (
                <option key={item.itemNo} value={item.itemNo}>
                  {item.itemName}
                </option>
              ))}
            </select>

            {selectedItem && (
              <>
                <div>
                  <label>Packing Unit:</label>
                  <select
                    value={packingUnit[selectedItem] || 'box'}
                    onChange={handlePackingUnitChange}
                  >
                    <option value="box">Boxes</option>
                    <option value="pallet">Pieces</option>
                  </select>
                </div>

                <div>
                  <label>Order Qty:</label>
                  <input
                    type="number"
                    value={orderQty[selectedItem] || 1} 
                    min="0"
                    onChange={handleQtyChange}
                    style={{ width: '60px', textAlign: 'center' }} 
                  />
                </div>
              </>
            )}
          </div>

          {/* Item Table */}
          <table>
            <thead>
              <tr>
                <th>Item No</th>
                <th>Item Name</th>
                <th>Stock Unit</th>
                <th>Unit Price</th>
                <th>Packing Unit</th>
                <th>Order Qty</th>
                <th>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.itemNo}>
                  <td>{item.itemNo}</td>
                  <td>{item.itemName}</td>
                  <td>{item.stockUnit}</td>
                  <td>{item.unitPrice}</td>
                  <td>{packingUnit[item.itemNo] || "box"}</td>
                  <td>{orderQty[item.itemNo] || 1}</td>
                  <td>{calculateNetAmount(item.itemNo, item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Export and Print Buttons */}
          <button onClick={exportToExcel}>Export to Excel</button>
          <button onClick={printPurchaseOrder}>Print Purchase Order</button>
        </>
      )}
    </div>
  );
};

export default PurchaseOrder;
