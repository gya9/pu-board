const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

let currentMode = 'move';
let isDrawing = false;
let startX, startY;
let uploadedImage = null;
let shapes = []; // 描画した図形を保持する配列

document.getElementById('move-icon').addEventListener('click', () => {
    currentMode = 'move';
    canvas.classList.add('active-cursor');
});

document.getElementById('draw-line').addEventListener('click', () => {
    currentMode = 'line';
    canvas.classList.remove('active-cursor');
});

document.getElementById('draw-arrow').addEventListener('click', () => {
    currentMode = 'arrow';
    canvas.classList.remove('active-cursor');
});

document.getElementById('eraser').addEventListener('click', () => {
    currentMode = 'eraser';
    canvas.classList.remove('active-cursor');
});

document.getElementById('icon-uploader').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            uploadedImage = img;
            currentMode = 'move';
            canvas.classList.add('active-cursor');
        };
    };
    reader.readAsDataURL(file);
});

canvas.addEventListener('mousedown', (event) => {
    if (currentMode === 'move' && uploadedImage) {
        const x = event.clientX - canvas.offsetLeft;
        const y = event.clientY - canvas.offsetTop;
        ctx.drawImage(uploadedImage, x, y, 50, 50);  // アイコンを指定サイズで描画
    } else if (currentMode === 'line' || currentMode === 'arrow') {
        isDrawing = true;
        startX = event.clientX - canvas.offsetLeft;
        startY = event.clientY - canvas.offsetTop;
    } else if (currentMode === 'eraser') {
        erase(event);
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDrawing && (currentMode === 'line' || currentMode === 'arrow')) {
        redrawCanvas();  // 再描画してから現在の図形を描く
        const currentX = event.clientX - canvas.offsetLeft;
        const currentY = event.clientY - canvas.offsetTop;
        drawLine(startX, startY, currentX, currentY, currentMode === 'arrow');
    } else if (currentMode === 'eraser') {
        erase(event);
    }
});

canvas.addEventListener('mouseup', (event) => {
    if (isDrawing && (currentMode === 'line' || currentMode === 'arrow')) {
        const endX = event.clientX - canvas.offsetLeft;
        const endY = event.clientY - canvas.offsetTop;
        shapes.push({
            type: currentMode,
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY
        });
    }
    isDrawing = false;
});

function drawLine(x1, y1, x2, y2, isArrow = false) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (isArrow) {
        drawArrowhead(x1, y1, x2, y2);
    }
}

function drawArrowhead(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 10;

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function erase(event) {
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
    ctx.clearRect(x - 10, y - 10, 20, 20);  // 消しゴムのサイズ
    shapes = shapes.filter(shape => !isShapeNear(shape, x, y));  // 図形が消しゴムの位置に近いかチェック
    redrawCanvas();  // 再描画
}

function isShapeNear(shape, x, y) {
    const tolerance = 10;  // 許容範囲
    return (Math.abs(shape.startX - x) < tolerance && Math.abs(shape.startY - y) < tolerance) ||
           (Math.abs(shape.endX - x) < tolerance && Math.abs(shape.endY - y) < tolerance);
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // キャンバスをクリア
    shapes.forEach(shape => {
        drawLine(shape.startX, shape.startY, shape.endX, shape.endY, shape.type === 'arrow');
    });
}
