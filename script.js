const incomeEntries = [];
const expenseEntries = [];

const incomeForm = document.getElementById("income-form");
const expenseForm = document.getElementById("expense-form");
const incomeList = document.getElementById("income-list");
const expenseList = document.getElementById("expense-list");
const balancePill = document.getElementById("balance-pill");

const chartCtx = document.getElementById("financeChart");

const financeChart = new Chart(chartCtx, {
  type: "line",
  data: {
    labels: ["Start"],
    datasets: [
      {
        label: "Income",
        data: [0],
        borderColor: "#7ef4bb",
        backgroundColor: "rgba(126, 244, 187, 0.2)",
        pointRadius: 4,
        tension: 0.32,
      },
      {
        label: "Expenses",
        data: [0],
        borderColor: "#ff8b9f",
        backgroundColor: "rgba(255, 139, 159, 0.2)",
        pointRadius: 4,
        tension: 0.32,
      },
      {
        label: "Net Balance",
        data: [0],
        borderColor: "#7ea7ff",
        backgroundColor: "rgba(126, 167, 255, 0.2)",
        borderWidth: 3,
        pointRadius: 4,
        tension: 0.32,
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#d6def0",
          boxWidth: 14,
          useBorderRadius: true,
          borderRadius: 4,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#a8b0c4" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
      y: {
        ticks: { color: "#a8b0c4" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
    },
  },
});

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function refreshList(targetList, entries, formatter) {
  targetList.innerHTML = "";

  entries
    .slice()
    .reverse()
    .forEach((entry) => {
      const item = document.createElement("li");
      item.innerHTML = `<span>${formatter(entry)}</span><strong>${formatCurrency(entry.amount)}</strong>`;
      targetList.appendChild(item);
    });
}

function totals() {
  const income = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const expense = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  return { income, expense, net: income - expense };
}

function refreshChart() {
  const incomePoints = [0];
  const expensePoints = [0];
  const labels = ["Start"];

  const maxLen = Math.max(incomeEntries.length, expenseEntries.length);

  for (let i = 0; i < maxLen; i += 1) {
    labels.push(`Log ${i + 1}`);

    const incomeSoFar = incomePoints[incomePoints.length - 1] + (incomeEntries[i]?.amount || 0);
    const expenseSoFar = expensePoints[expensePoints.length - 1] + (expenseEntries[i]?.amount || 0);

    incomePoints.push(Number(incomeSoFar.toFixed(2)));
    expensePoints.push(Number(expenseSoFar.toFixed(2)));
  }

  const netPoints = incomePoints.map((value, index) => Number((value - expensePoints[index]).toFixed(2)));

  financeChart.data.labels = labels;
  financeChart.data.datasets[0].data = incomePoints;
  financeChart.data.datasets[1].data = expensePoints;
  financeChart.data.datasets[2].data = netPoints;
  financeChart.update();

  const { net } = totals();
  balancePill.textContent = `Net: ${formatCurrency(net)}`;
  balancePill.style.borderColor = net >= 0 ? "rgba(126, 244, 187, 0.7)" : "rgba(255, 139, 159, 0.7)";
  balancePill.style.background = net >= 0 ? "rgba(126, 244, 187, 0.15)" : "rgba(255, 139, 159, 0.15)";
  balancePill.style.color = net >= 0 ? "#7ef4bb" : "#ff8b9f";
}

incomeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(document.getElementById("income-amount").value);
  const treatment = document.getElementById("income-treatment").value.trim();

  if (!amount || !treatment) {
    return;
  }

  incomeEntries.push({ amount, treatment });
  incomeForm.reset();

  refreshList(incomeList, incomeEntries, (entry) => `Treatment: ${entry.treatment}`);
  refreshChart();
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;

  if (!amount || !category) {
    return;
  }

  expenseEntries.push({ amount, category });
  expenseForm.reset();

  refreshList(expenseList, expenseEntries, (entry) => `Category: ${entry.category}`);
  refreshChart();
});
