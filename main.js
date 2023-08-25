const app = document.getElementById('app');
const pcButtons = document.getElementById('pincodeButtons');
const screen = document.getElementById('pincodeScreen');
const pcContainer = document.getElementById('pincodeContainer');
const clickS = new Audio('sounds/click.mp3');
const errorS = new Audio('sounds/error.mp3');
const successS = new Audio('sounds/success.mp3');
const testerContainer = document.getElementById('testerContainer');
const testerScreen = document.getElementById('testScreen');
const testerOptions = document.getElementById('testOptions');
let currentLab;





// PINCODE
const addNumberToScreen = (number) => {
  if (screen.innerText.length >= 4) return;
  screen.innerText += number;
}

const setupButton = (button, value) => {
  button.innerText = value;
  button.classList.add('pincodeButton');
  button.addEventListener('click', () => {
    clickS.play();
    if (typeof value == 'number') {
      addNumberToScreen(value);
    } else if (value == 'C') {
      screen.innerText = '';
    }
    else if (value == 'OK') {
      submitPincode(screen.innerText);
    }
  });
  pcButtons.appendChild(button);
}

const setupButtons = () => {
  for (let i = 1; i < 10; i++) {
    const button = document.createElement('button');
    setupButton(button, i);
  }
  const extraButtons = ['C', 0, 'OK'];
  extraButtons.forEach((value) => {
    const button = document.createElement('button');
    setupButton(button, value);
  });
}

const openPincode = () => {
  if (pcContainer.classList.contains('hidden')) {
    pcContainer.classList.remove('hidden')
  }
  if (screen.innerText.length > 0) {
    screen.innerText = '';
  }
}

const closePincode = () => {
  currentLab = null;
  if (!pcContainer.classList.contains('hidden')) {
    pcContainer.classList.add('hidden')
  }
  fetch(`https://pandadrugs/close`)
  .catch(err => console.log(err));
}

const successfullPincode = () => {
  screen.innerText = 'PIN OK';
  screen.classList.add('success');
  successS.play();
  setTimeout(() => {
  closePincode();
  screen.innerText = '';
  screen.classList.remove('success');
  }, 1000);
}

const errorPincode = () => {
  screen.innerText = 'ERROR';
  screen.classList.add('error');
  errorS.play();
  setTimeout(() => {
  screen.innerText = '';
  screen.classList.remove('error');
  }, 1000);
}

const submitPincode = (pincode) => {
  fetch(`https://pandadrugs/checkPincode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pincode, labid: currentLab })
  })
    .then(res => res.json())
    .then(data => {
      if (data) {
        successfullPincode();
      } else {
        errorPincode();
      }
    })
    .catch(err => console.log(err));
}


// Tester


const openTester = (drugsHeld) => {
  if (testerContainer.classList.contains('hidden')) {
    testerContainer.classList.remove('hidden')
  }
  SetUpTester(drugsHeld);
}

const toggleTesterSize = () => {
  if (!testerContainer.classList.contains('largerTester')) {
    testerContainer.classList.add('largerTester')
  } else {
    testerContainer.classList.remove('largerTester')
  }
}

const toggleMinimiseTester = () => {
  if (!testerContainer.classList.contains('minimisedTester')) {
    testerContainer.classList.add('minimisedTester')
    testerScreen.classList.add('hidden');
    testerOptions.classList.add('hidden');
  } else {
    testerContainer.classList.remove('minimisedTester')
    testerScreen.classList.remove('hidden');
    testerOptions.classList.remove('hidden');
  }
}

const closeTester = () => {
  if (!testerContainer.classList.contains('hidden')) {
    testerContainer.classList.add('hidden')
  }
  testerScreen.innerText = '';
  testerOptions.innerHTML = '';
  fetch(`https://pandadrugs/close`)
  .catch(err => console.log(err));
}


const SetUpTester = (drugsHeld) => {
  testerOptions.innerHTML = '';
  if (!typeof drugsHeld == 'object') return;
  drugsHeld.forEach((drug) => {
    if (drug && drug.label) {
    const drugContainer = document.createElement('div');
    drugContainer.classList.add('drugContainer');
    drugContainer.innerHTML = `
    <div class="drugIcon">
      <img src="nui://qb-inventory/html/images/${drug.image}" alt="${drug.name}">
    </div>
    <div class="drugName">
      ${drug.label}
    </div>
    <div class="drugTest" id="drugTest${drug.slot}">
      Test
    </div>
    `
    const TestButton = drugContainer.querySelector(`#drugTest${drug.slot}`);
    TestButton.addEventListener('click', () => {
      ShowTestResult(drug);
    });
    testerOptions.appendChild(drugContainer);
  }
  });

  // testerScreen
  // testerOptions
}

const ShowTestResult = (drug) => {
  testerScreen.innerHTML = 'Testing <div class="lds"><div></div><div></div><div></div></div>';
  fetch(`https://pandadrugs/testDrug`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({drug})
  })
  .then(res => res.json())
  .then(data => {
    if (data) {
      let purity = `${(drug.info.purity * 100)}%`;
        clickS.play();
        testerScreen.innerText = purity || "Error";
    } else {
      testerScreen.innerText = 'Inconclusive';
    }
  })
  .catch(err => {
    console.log(err)
    testerScreen.innerText = 'Error';
  });
}


window.addEventListener('message', (event) => {
  let drugsHeld = undefined;
  const { action, labid, drugItems } = event.data;
  drugsHeld = drugItems;
  switch(action) {
    case 'openPincodeMenu':
      currentLab = labid;
      openPincode();
      break;
    case 'closePincodeMenu':
      closePincode();
      break;
    case 'openTester':
      openTester(drugsHeld);
      break;
    case 'closeTester':
      closeTester();
      break;
      }
});

const closeAll = () => {
  closePincode();
  closeTester();
}

window.addEventListener('keyup', (event) => {
  const { key } = event;
  switch (key) {
    case 'Escape':
      closeAll();
      break;
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '8':
    case '9':
      if (pcContainer.classList.contains('hidden')) return;
      addNumberToScreen(key);
      break;
    case 'Enter':
      if (pcContainer.classList.contains('hidden')) return;
      submitPincode(screen.innerText);
      break;
    case 'Backspace':
      if (pcContainer.classList.contains('hidden')) return;
      screen.innerText = screen.innerText.slice(0, -1);
      break;


  }
});

setupButtons();