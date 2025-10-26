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

// 拖曳卡片
cards.forEach(card => {
  // PC 拖曳
  card.addEventListener('dragstart', e => {
    draggedCard = card;
    e.dataTransfer.setData('text/plain', card.dataset.num);
  });

  // 點擊翻轉
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });

  // 手機觸控拖曳
  card.addEventListener('touchstart', e => { draggedCard = card; });
  card.addEventListener('touchend', e => {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (!draggedCard) return;

    // 找到最近的 image-slot 容器
    const slot = target.closest('.image-slot');
    if (slot) {
      dropToSlot(slot, draggedCard);
    }
    draggedCard = null;
  });
});

// 放入圖片格（拖曳或置換）
slots.forEach(slot => {
  slot.addEventListener('dragover', e => e.preventDefault());
  slot.addEventListener('drop', e => {
    e.preventDefault();
    if (draggedCard) dropToSlot(slot, draggedCard);
  });
});

function dropToSlot(slot, card) {
  // 移除原本 slot 內容
  slot.innerHTML = '';

  // Clone 卡片的內部圖片（.card-inner）
  const imgNode = card.querySelector('.card-inner').cloneNode(true);
  slot.appendChild(imgNode);

  // 更新 slot 的 dataset，方便比對
  slot.dataset.num = card.dataset.num;
}

// === (3) 比對正確順序 ===
const correctOrder = [3, 1, 2, 8, 4, 9, 12, 7, 6, 10, 5, 11];
document.getElementById('checkOrder').addEventListener('click', () => {
  slots.forEach((slot, i) => {
    if (parseInt(slot.dataset.num) === correctOrder[i]) {
      slot.classList.remove('wrong');
    } else {
      slot.classList.add('wrong');
    }
  });
});


