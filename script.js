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
  minutesOut.textContent = `${totalCook} minutes`;
  hoursOut.textContent = `${Math.floor(totalCook/60)} hr ${totalCook%60} min (+ ${restMinutes} min rest)`;

  // Timetable calculation
  if(readyTime.value){
    const [h,m] = readyTime.value.split(":").map(Number);
    const ready = new Date();
    ready.setHours(h,m,0,0);

    const startCooking = new Date(ready.getTime() - (totalCook + restMinutes)*60000);
    const preheatTime = 15; // minutes
    const preheatStart = new Date(startCooking.getTime() - preheatTime*60000);

    const bastingInterval = 45; // minutes

    timetableList.innerHTML = '';
    // Preheat
    const liPreheat = document.createElement('li');
    liPreheat.textContent = `Start preheating oven at ${formatTime(preheatStart)}`;
    timetableList.appendChild(liPreheat);

    // Put in oven
    const liPutIn = document.createElement('li');
    liPutIn.textContent = `Put turkey in oven at ${formatTime(startCooking)}`;
    timetableList.appendChild(liPutIn);

    // Add basting times
    const numBastes = Math.floor(totalCook / bastingInterval);
    for(let i=1;i<=numBastes;i++){
      const bastingTime = new Date(startCooking.getTime() + bastingInterval*i*60000);
      if(bastingTime < new Date(startCooking.getTime() + totalCook*60000)){
        const liBaste = document.createElement('li');
        liBaste.textContent = `Baste at ${formatTime(bastingTime)}`;
        timetableList.appendChild(liBaste);
      }
    }

    // Take out to rest
    const liCookEnd = document.createElement('li');
    liCookEnd.textContent = `Take turkey out at ${formatTime(new Date(startCooking.getTime() + totalCook*60000))} to rest`;
    timetableList.appendChild(liCookEnd);

    // Serve
    const liServe = document.createElement('li');
    liServe.textContent = `Serve at ${formatTime(ready)}`;
    timetableList.appendChild(liServe);

  } else {
    timetableList.innerHTML = '<li>—</li>';
  }
}

document.querySelectorAll("input").forEach(el => el.addEventListener("input", calculate));
calculate();
