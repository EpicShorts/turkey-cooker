const weight = document.getElementById("weight");
const temp = document.getElementById("temp");
const stuffed = document.getElementById("stuffed");
const fan = document.getElementById("fan");
const readyTime = document.getElementById("readyTime");

const weightValue = document.getElementById("weightValue");
const tempValue = document.getElementById("tempValue");
const minutesOut = document.getElementById("minutes");
const hoursOut = document.getElementById("hours");
const restValue = document.getElementById("restValue");
const timetableList = document.getElementById("timetableList");

function formatTime(date){
  return date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

function calculate() {
  const w = parseFloat(weight.value);

  // Round temp to nearest 5°C for calculation
  let T_raw = parseFloat(temp.value);
  let T = Math.round(T_raw / 5) * 5;

  const S = stuffed.checked ? 1.2 : 1.0;
  const F = fan.checked ? 0.9 : 1.0;

  // Cooking time
  const cookMinutes = 31 * w * (165 / T) * S * F;
  const totalCook = Math.round(cookMinutes);

  // Automatic resting time
  let baseRest;
  if (w <= 4) baseRest = 18;
  else if (w <= 7) baseRest = 25;
  else if (w <= 10) baseRest = 35;
  else baseRest = 50;
  const restMinutes = Math.round(baseRest * Math.pow(165 / T, 0.1));

  // Update display
  weightValue.textContent = w.toFixed(1);
  tempValue.textContent = T;
  restValue.textContent = restMinutes;
  
  // Format nicely: e.g. "3h 15m"
  const h = Math.floor(totalCook/60);
  const m = totalCook % 60;
  const timeString = h > 0 ? `${h}h ${m}m` : `${m}m`;
  
  minutesOut.textContent = timeString;
  hoursOut.textContent = `(${totalCook} minutes total)`;

  // Timetable calculation
  if(readyTime.value){
    const [h,m] = readyTime.value.split(":").map(Number);
    const ready = new Date();
    ready.setHours(h,m,0,0);
    
    // Handle day rollover if needed (simple check)
    // If ready time is in the past relative to now, we might usually assume it's for 'today' or 'tomorrow'.
    // But for a simple calc, just using the Date object as is, is fine.
    
    const startCooking = new Date(ready.getTime() - (totalCook + restMinutes)*60000);
    const preheatTime = 20; // Increased to 20 for safety/realism
    const preheatStart = new Date(startCooking.getTime() - preheatTime*60000);

    const bastingInterval = 45; // minutes

    timetableList.innerHTML = '';
    
    // Helper for items
    const addItem = (time, text, isHighlight = false) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${formatTime(time)}</strong> ${text}`;
        if(isHighlight) li.style.color = 'var(--text)'; // specific highlight if needed
        timetableList.appendChild(li);
    };

    // Preheat
    addItem(preheatStart, "Start preheating oven");

    // Put in oven
    addItem(startCooking, "Put turkey in oven");

    // Add basting times
    const numBastes = Math.floor(totalCook / bastingInterval);
    for(let i=1;i<=numBastes;i++){
      const bastingTime = new Date(startCooking.getTime() + bastingInterval*i*60000);
      // Don't baste if it's within the last 20 mins of cooking
      if(bastingTime < new Date(startCooking.getTime() + (totalCook-20)*60000)){
        addItem(bastingTime, "Baste turkey");
      }
    }

    // Take out to rest
    const restStart = new Date(startCooking.getTime() + totalCook*60000);
    addItem(restStart, "Take out to rest (Cover with foil)");

    // Serve
    addItem(ready, "Carve and Serve! 🦃");

  } else {
    timetableList.innerHTML = '<li>Set a "Ready by" time to see the schedule</li>';
  }
}

document.querySelectorAll("input").forEach(el => el.addEventListener("input", calculate));
calculate();
