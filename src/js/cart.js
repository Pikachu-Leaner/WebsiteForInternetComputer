function createCartItemCard(item) {
  // Calculate the total price for this specific row
  const rowTotal = item.price * item.quantity;

  // Determine if the checkbox should be checked based on backend data
  const isChecked = item.selected ? 'checked' : '';

  return `
        <tr data-item-id="${item.id}">
            <td>
                <input class="form-check-input custom-checkbox" type="checkbox" ${isChecked}>
            </td>
            <td>${item.id}</td>
            <td>
                <img src="${item.img}" alt="${item.name}" class="product-img">
            </td>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>
                <div class="d-flex justify-content-center align-items-center">
                    <button class="btn btn-qty btn-purple shadow-sm">+</button>
                    <input type="text" class="form-control text-center mx-2 qty-input" value="${item.quantity}" readonly>
                    <button class="btn btn-qty btn-purple shadow-sm">-</button>
                </div>
            </td>
            <td>${rowTotal}</td>
            <td class="text-center">
                <button class="btn btn-action btn-purple shadow-sm me-2">EDIT</button>
                <button class="btn btn-action btn-red shadow-sm">DELETE</button>
            </td>
        </tr>
    `;
}
