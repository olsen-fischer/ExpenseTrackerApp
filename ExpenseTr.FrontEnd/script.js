let totalAmount = document.getElementById("total-amount");
let userAmount = document.getElementById("user-amount");
const checkAmountButton = document.getElementById("check-amount");
const totalAmountButton = document.getElementById("total-amount-button");
const productTitle = document.getElementById("product-title");
const errorMessage = document.getElementById("budget-error");
const productTitleError = document.getElementById("product-title-error");
const amount = document.getElementById("amount");
const expenditureValue = document.getElementById("expenditure-value");
const balanceValue = document.getElementById("balance-amount");
const list = document.getElementById("list");
const categorySelect = document.getElementById("category");
const downloadCsvButton = document.getElementById("download");

let tempAmount = 0;

// Format currency
function formatCurrency(amount) {
  return `Ksh ${amount.toFixed(2)}`;
}

// Add total amount
totalAmountButton.addEventListener("click", () => {
  tempAmount = parseFloat(totalAmount.value);

  if (isNaN(tempAmount) || tempAmount <= 0) {
    errorMessage.classList.remove("hide");
  } else {
    errorMessage.classList.add("hide");
    amount.innerHTML = formatCurrency(tempAmount);
    balanceValue.innerText = formatCurrency(tempAmount - parseFloat(expenditureValue.innerText.replace('Ksh ', '')));
    totalAmount.value = "";
  }
});

// Disable buttons
const disableButtons = (bool) => {
  let editButtons = document.getElementsByClassName("edit");
  Array.from(editButtons).forEach((element) => {
    element.disabled = bool;
  });
};

// Modify list elements
function modifyElement(element, isEditing, sublistContent) {
  if (isEditing) {
    const expenseName = sublistContent.querySelector('.product').textContent;
    const expenseValue = parseFloat(sublistContent.querySelector('.amount').textContent.replace('Ksh ', ''));
    const expenseCategory = sublistContent.querySelector('.category').textContent;

    productTitle.value = expenseName;
    userAmount.value = expenseValue;
    categorySelect.value = expenseCategory;

    list.removeChild(sublistContent);
    const sum = parseFloat(expenditureValue.innerText.replace('Ksh ', '')) - expenseValue;
    expenditureValue.innerText = formatCurrency(sum);
    const totalBalance = tempAmount - sum;
    balanceValue.innerText = formatCurrency(totalBalance);
  } else {
    const expenseValue = parseFloat(sublistContent.querySelector('.amount').textContent.replace('Ksh ', ''));
    list.removeChild(element.parentElement);
    const sum = parseFloat(expenditureValue.innerText.replace('Ksh ', '')) - expenseValue;
    expenditureValue.innerText = formatCurrency(sum);
    const totalBalance = tempAmount - sum;
    balanceValue.innerText = formatCurrency(totalBalance);
  }
}

// Update total expenditure and balance
function updateTotalAndBalance() {
  const items = list.querySelectorAll('.sublist-content');
  let totalExpenditure = 0;
  items.forEach(item => {
    const amount = parseFloat(item.querySelector('.amount').textContent.replace('Ksh ', ''));
    totalExpenditure += amount;
  });
  expenditureValue.innerText = formatCurrency(totalExpenditure);
  const totalBalance = tempAmount - totalExpenditure;
  balanceValue.innerText = formatCurrency(totalBalance);
}

// Create list elements
const listCreator = (expenseName, expenseValue, expenseCategory) => {
  let sublistContent = document.createElement("div");
  sublistContent.classList.add("sublist-content", "flex-space");

  let currentDate = new Date();
  let formattedDate = currentDate.toLocaleDateString()

  sublistContent.innerHTML = `
    <p class="product">${expenseName}</p>
    <p class="amount">${formatCurrency(parseFloat(expenseValue))}</p>
    <p class="category">${expenseCategory}</p>
    <p class="date">${formattedDate}</p>
  `;

  let editButton = document.createElement("button");
  editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");
  editButton.style.fontSize = "1.2em";
  editButton.addEventListener("click", () => {
    modifyElement(editButton, true, sublistContent);
  });

  let deleteButton = document.createElement("button");
  deleteButton.classList.add("fa-solid", "fa-trash-can", "delete");
  deleteButton.style.fontSize = "1.2em";
  deleteButton.addEventListener("click", () => {
    modifyElement(deleteButton, false, sublistContent);
  });

  sublistContent.appendChild(editButton);
  sublistContent.appendChild(deleteButton);

  list.appendChild(sublistContent);
  downloadCsvButton.style.display = "Block";

};

// Delete a transaction from the backend
async function deleteTransaction(id) {
  try {
    const response = await fetch(`https://localhost:7266/transactions/${id0}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`Transaction with ID ${id} deleted successfully`);
    updateTotalAndBalance(await fetchAllTransactions());
  } catch (error) {
    console.error('Error deleting transaction:', error);
  }
}


// Add expenses
checkAmountButton.addEventListener("click", async () => {
  if (!userAmount.value || !productTitle.value || categorySelect.value === 'Select') {
    productTitleError.classList.remove("hide");
    return false;
  }
  productTitleError.classList.add("hide");
  disableButtons(false);

  let expenditure = parseFloat(userAmount.value);
  let sum = parseFloat(expenditureValue.innerText.replace('Ksh ', '')) + expenditure;
  expenditureValue.innerText = formatCurrency(sum);

  const totalBalance = tempAmount - sum;
  balanceValue.innerText = formatCurrency(totalBalance);

  const transaction = {
    description: productTitle.value,
    amount: expenditure,
    category: categorySelect.value,
    date: new Date()
  };

  addTransaction(transaction);
  
  productTitle.value = "";
  userAmount.value = "";
  categorySelect.value = "Select";
});
// Function to set the budget (Total Income)
totalAmountButton.addEventListener("click", () => {
  if (!totalAmount.value || totalAmount.value <= 0) {
    budgetError.classList.remove("hide");
    return;
  } 
  budgetError.classList.add("hide");

  tempAmount = parseFloat(totalAmount.value);
  amount.innerText = formatCurrency(tempAmount);
  balanceValue.innerText = formatCurrency(tempAmount - parseFloat(expenditureValue.innerText.replace('Ksh ', '')));

  totalAmount.value = "";
});



// Add a new transaction to the backend
async function addTransaction(transaction) {
  try {
    console.log('Sending transaction:', transaction);
    const response = await fetch('https://localhost:7266/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const createdTransaction = await response.json();
    listCreator(createdTransaction.description, createdTransaction.amount, createdTransaction.category, createdTransaction.date);
  } catch (error) {
    console.error('Error adding transaction:', error);
  }
}

// Fetch all transactions from the backend
async function fetchAllTransactions() {
  try {
    const response = await fetch('https://localhost:7266/transactions');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const transactions = await response.json();
    transactions.forEach(transaction => {
      listCreator(transaction.description, transaction.amount, transaction.category, transaction.date);
    });
    updateTotalAndBalance(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

// Fetch transactions by category
async function fetchTransactionsByCategory(category) {
  try {
    const response = await fetch(`https://localhost:7266/transactions/category/Grocery${category}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const transactions = await response.json();
    list.innerHTML = '';
    transactions.forEach(transaction => {
      listCreator(transaction.description, transaction.amount, transaction.category, transaction.date);
    });
    updateTotalAndBalance(transactions);
  } catch (error) {
    console.error('Error fetching transactions by category:', error);
  }
}


// Add event listener to the download button for downloading CSV
downloadCsvButton.addEventListener("click", async () => {
  try {
    const response = await fetch('https://localhost:7266/transactions');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const transactions = await response.json();

    if (transactions.length === 0) {
      alert("No transactions to download.");
      return;
    }

    let csv = "Description,Amount,Category,Date\n";
    transactions.forEach(transaction => {
      csv += `${transaction.description},${transaction.amount},${transaction.category},${transaction.date}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading CSV:', error);
  }
});

// Initial fetch to populate the list on page load
document.addEventListener("DOMContentLoaded", fetchAllTransactions);
document.addEventListener("DOMContentLoaded", deleteTransaction);
