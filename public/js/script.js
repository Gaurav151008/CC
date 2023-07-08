const express = require("express");
const carts = require("../../models/cart");

function showPopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "block";
    
    setTimeout(function() {
      popup.style.display = "none";
    }, 2000); // Hide the popup after 2 seconds (adjust the delay as needed)
  }

  const quantityInput = document.querySelector('[name="itemqun"]');

  // Get the corresponding table cell
  const quantityCell = document.querySelector('.quantity-cell[data-itemid="1"]');

  // Listen for the input event on the quantity input field
  quantityInput.addEventListener('input', async (event) => {
    const newQuantity = event.target.value;
    // Update the table cell with the new quantity
    quantityCell.textContent = newQuantity;

    // Update the quantity in the database
    const filter = { itemId: '' }; // Adjust the filter criteria as per your database structure
    const update = { $set: { itemqun: newQuantity } }; // Adjust the field to be updated
    try {
      const result = await collection.updateOne(filter, update);
      console.log('Quantity updated in the database');
    } catch (error) {
      console.error('Failed to update quantity in the database:', error);
    }
  });


  function removeItem(itemId) {
    // Send a request to the server to remove the item
    fetch('/removeitem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itemId: itemId })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Item successfully removed from the cart
          // Reload the page to reflect the changes
          location.reload();
        } else {
          // Error occurred while removing the item
          console.log(data.error);
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
  }

  function toggleStatus(button) {
    button.classList.toggle('toggle-on');
  }
  
  function sendNotify(fdcId) {
    var socket = io();
  
    console.log("Entry2");
  
    // Emit the 'notify' event with the food counter ID
    socket.emit("notify", {
      fdcid: fdcId
    });
    toastr.success("Notification sent to vendor");

  }
  