// ======= DOM Elements =======
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const monthFilter = document.getElementById("monthFilter");
const exportBtn = document.getElementById("exportBtn");
const themeToggle = document.getElementById("theme-toggle");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;

// ======= Functions =======
function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const incomeTotal = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0).toFixed(2);
  const expenseTotal = (
    amounts.filter(a => a < 0).reduce((a, b) => a + b, 0) * -1
  ).toFixed(2);

  balance.innerText = `$${total}`;
  income.innerText = `+$${incomeTotal}`;
  expense.innerText = `-$${expenseTotal}`;
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "minus" : "plus");
  item.innerHTML = `
    ${transaction.text} <small>(${transaction.category})</small>
    <span>${sign}$${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;
  list.appendChild(item);
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function init() {
  list.innerHTML = "";
  const selectedMonth = monthFilter.value;
  const filtered =
    selectedMonth === "all"
      ? transactions
      : transactions.filter(t => t.month === selectedMonth);
  filtered.forEach(addTransactionDOM);
  updateValues();
  updateChart(filtered);
  setupMonths();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value,
    category: category.value,
    month,
  };

  transactions.push(transaction);
  updateLocalStorage();
  init();

  text.value = "";
  amount.value = "";
});

function setupMonths() {
  const months = [...new Set(transactions.map(t => t.month))];
  monthFilter.innerHTML = `<option value="all">All Months</option>`;
  months.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    monthFilter.appendChild(opt);
  });
}

monthFilter.addEventListener("change", init);

// ======= Dark Mode =======
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

window.addEventListener("load", () => {
  const darkMode = JSON.parse(localStorage.getItem("darkMode"));
  if (darkMode) {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
});

// ======= Export CSV =======
exportBtn.addEventListener("click", () => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    ["Text,Amount,Category,Month"]
      .concat(
        transactions.map(
          t => `${t.text},${t.amount},${t.category},${t.month}`
        )
      )
      .join("\n");
  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = "transactions.csv";
  link.click();
});

// ======= Chart.js =======
function updateChart(data) {
  const ctx = document.getElementById("chart").getContext("2d");
  const categories = [...new Set(data.map(t => t.category))];
  const totals = categories.map(cat =>
    data
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [
        {
          data: totals,
          backgroundColor: ["#4CAF50", "#FF6384", "#FFCE56", "#36A2EB", "#9966FF"],
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

init();
