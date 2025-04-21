// Globális változók
let vacations = [];
let totalVacationDays = 25; // Alapértelmezett érték

// Oldal betöltésekor ellenőrizzük, hogy van-e mentett adat
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem("totalVacationDays")) {
    totalVacationDays = parseInt(localStorage.getItem("totalVacationDays"));
    document.getElementById('totalDays').value = totalVacationDays;
  }
  
  if (localStorage.getItem("vacations")) {
    vacations = JSON.parse(localStorage.getItem("vacations"));
  }
  
  updateUI();
  
  // Teljes napok mentése
  document.getElementById('saveTotal').addEventListener('click', function(){
    let newTotal = parseInt(document.getElementById('totalDays').value);
    if (!isNaN(newTotal)) {
      totalVacationDays = newTotal;
      localStorage.setItem("totalVacationDays", totalVacationDays);
      updateUI();
    }
  });

  // Új szabadság hozzáadása
  document.getElementById('addVacationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let vacDate = document.getElementById('vacationDate').value;
    let vacDuration = parseInt(document.getElementById('vacationDuration').value);
    if (vacDate && !isNaN(vacDuration)) {
      vacations.push({ date: vacDate, duration: vacDuration });
      // Rendezzük a szabadságokat dátum szerint növekvő sorrendbe
      vacations.sort((a, b) => new Date(a.date) - new Date(b.date));
      localStorage.setItem("vacations", JSON.stringify(vacations));
      updateUI();
      document.getElementById('addVacationForm').reset();
    }
  });
});

// Számolja ki a levonandó szabadság napokat
function calculateRemaining() {
  let usedDays = vacations.reduce((sum, vac) => sum + parseInt(vac.duration), 0);
  return totalVacationDays - usedDays;
}

// Ellenőrzi, hogy a megadott dátum teljesült-e (<= mai dátum)
function isCompleted(dateStr) {
  let todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD formátum
  return dateStr <= todayStr;
}

// UI frissítése
function updateUI() {
  updateCounter();
  updateVacationList();
  updateMonthlySummary();
}

// Számláló frissítése
function updateCounter() {
  document.getElementById('displayTotal').textContent = totalVacationDays;
  document.getElementById('displayRemaining').textContent = calculateRemaining();
}

// Szabadságok listájának frissítése
function updateVacationList() {
  let list = document.getElementById('vacationList');
  list.innerHTML = "";
  vacations.forEach((vac, index) => {
    let li = document.createElement('li');
    let statusClass = isCompleted(vac.date) ? "completed" : "planned";
    let statusText = isCompleted(vac.date) ? "Teljesült" : "Tervezett";
    li.innerHTML = `<div class="vacation-item">
                      <span class="vacation-date">${index + 1}. ${vac.date}</span>
                      <span>${vac.duration} nap - <span class="${statusClass}">${statusText}</span></span>
                    </div>`;
    list.appendChild(li);
  });
}

// Havi összegzés elkészítése
function updateMonthlySummary() {
  let summaryContainer = document.getElementById('summaryContainer');
  summaryContainer.innerHTML = "";
  
  // Csoportosítás hónapok szerint (YYYY-MM)
  let summaryData = {};
  vacations.forEach(vac => {
    let month = vac.date.slice(0, 7);
    if (!summaryData[month]) {
      summaryData[month] = { completed: 0, planned: 0 };
    }
    if (isCompleted(vac.date)) {
      summaryData[month].completed += vac.duration;
    } else {
      summaryData[month].planned += vac.duration;
    }
  });
  
  // Összegző elemek létrehozása minden hónapra
  for (let month in summaryData) {
    let div = document.createElement('div');
    div.className = "summary-item";
    div.innerHTML = `<p><strong>${month}</strong></p>
                     <p>Beteljesült szabadság: ${summaryData[month].completed} nap</p>
                     <p>Tervezett szabadság: ${summaryData[month].planned} nap</p>`;
    summaryContainer.appendChild(div);
  }
}
