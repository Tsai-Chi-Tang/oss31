// === (2) 單位換算 ===
const byInput = document.getElementById('byInput');
const myInput = document.getElementById('myInput');
const kyInput = document.getElementById('kyInput');

byInput.addEventListener('input', () => convertFrom('BY'));
myInput.addEventListener('input', () => convertFrom('MY'));
kyInput.addEventListener('input', () => convertFrom('KY'));

function convertFrom(unit) {
  let by, my, ky;
  if (unit === 'BY') {
    by = parseFloat(byInput.value);
    my = by * 1000;
    ky = by * 1000000;
  } else if (unit === 'MY') {
    my = parseFloat(myInput.value);
    by = my / 1000;
    ky = my * 1000;
  } else if (unit === 'KY') {
    ky = parseFloat(kyInput.value);
    my = ky / 1000;
    by = ky / 1000000;
  }
  if (!isNaN(by)) byInput.value = by;
  if (!isNaN(my)) myInput.value = my;
  if (!isNaN(ky)) kyInput.value = ky;
}

// === (3) 拖曳與翻轉 ===
const cards = document.querySelectorAll('.card');
const slots = document.querySelectorAll('.image-slot');
let draggedCard = null;

cards.forEach(card => {
  // 拖曳開始
  card.addEventListener('dragstart', e => {
    draggedCard = card;
    e.dataTransfer.setData('text/plain', card.dataset.num);
  });

  // 點擊翻轉
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });

  // 觸控拖曳 (行動裝置)
  card.addEventListener('touchstart', e => { draggedCard = card; });
  card.addEventListener('touchend', e => {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.classList.contains('image-slot')) {
      dropToSlot(target);
    }
    draggedCard = null;
  });
});

// 放入圖片格
slots.forEach(slot => {
  slot.addEventListener('dragover', e => e.preventDefault());
  slot.addEventListener('drop', e => {
    e.preventDefault();
    dropToSlot(slot);
  });
});

function dropToSlot(slot) {
  if (!draggedCard) return;
  const imgNode = draggedCard.querySelector('.card-inner').cloneNode(true);
  slot.innerHTML = '';
  slot.appendChild(imgNode);
  slot.dataset.num = draggedCard.dataset.num;
}

// === (3) 比對正確順序 ===
const correctOrder = [3, 1, 2, 8, 4, 9, 12, 7, 6, 10, 11, 5];
document.getElementById('checkOrder').addEventListener('click', () => {
  slots.forEach((slot, i) => {
    if (parseInt(slot.dataset.num) === correctOrder[i]) {
      slot.classList.remove('wrong');
    } else {
      slot.classList.add('wrong');
    }
  });
});
