const canvasSize = getComputedStyle(document.documentElement).getPropertyValue('--canvas-size').split("px")[0].trim();

// Settings
const rowSlider = document.querySelector("#rows-range");
const rowInput = document.querySelector("#rows-input");
const marginSlider = document.querySelector("#margin-range");
const marginInput = document.querySelector("#margin-input");
function copyValue(from, to) {
    to.value = from.value;
    rows = Number(rowSlider.value)
    pixelMargin = Number(marginSlider.value)
    pixelSize = ((canvasSize - pixelMargin * rows) / rows)
    if (pixelSize < 1) pixelSize = 1;
}
rowSlider.oninput = () => {
    copyValue(rowSlider, rowInput);
}
rowInput.oninput = () => {
    copyValue(rowInput, rowSlider);
}
marginSlider.oninput = () => {
    copyValue(marginSlider, marginInput);
}
marginInput.oninput = () => {
    copyValue(marginInput, marginSlider);
}
rowSlider.oninput();
marginSlider.oninput();

// Pixelate
var rows // n of rows
var pixelSize // size of each "pixel"
var pixelMargin // whitespace between pixels

const originalCanvas = document.querySelector("#original"); // Original canvas
const original = originalCanvas.getContext("2d");

const canvas = document.querySelector("#pixelated"); // Draw Canvas
const context = canvas.getContext("2d");
canvas.onmousemove = (event) => { canvasMouseOver(event); }
canvas.onmouseout = () => {
    document.querySelector("#color-div").style.display = "none"
}

const mainDiv = document.querySelector("#div-canvas") // Div "Canvas"

Array.from(document.querySelectorAll("canvas")).forEach(c => {
    c.width = canvasSize;
    c.height = canvasSize;
});

const image = new Image();
image.src = "img.jpg";
image.onload = () => {
    original.drawImage(image, 0, 0, canvasSize, canvasSize);
}

document.querySelector("button").onclick = pixelate;

// Picture-chooser
const imageChooserDiv = document.querySelector("#img-choose")

originalCanvas.onclick = () => {
    const chooseDiv = document.querySelector("#img-choose")
    const bodyRect = document.body.getBoundingClientRect()
    chooseDiv.style.left = originalCanvas.getBoundingClientRect().left + "px"
    chooseDiv.style.top = (originalCanvas.getBoundingClientRect().top - bodyRect.top + 8) + "px"

    chooseDiv.style.width = originalCanvas.width + "px"
    chooseDiv.style.height = originalCanvas.height + "px"
    chooseDiv.style.display = "flex"
}
imageChooserDiv.onmouseleave = function () {
    imageChooserDiv.style.display = "none"
}
Array.from(imageChooserDiv.querySelectorAll("img")).forEach((img) => {
    img.onclick = () => {
        image.src = img.src
        image.onload()
        imageChooserDiv.onmouseleave()
    }
})

function pixelate() {
    // drawLoading()

    setTimeout(() => {
        context.clearRect(0, 0, canvas.width, canvas.height)

        const amountOfCells = Math.ceil(canvasSize / (pixelSize + pixelMargin))
        const selectedAnim = document.querySelector('input[name="animation"]:checked').value;
        calculateDivBox(amountOfCells)

        if (selectedAnim == "randXrow") {
            drawTrickleDown(amountOfCells)
            divDrawTrickleDown(amountOfCells)
        } else if (selectedAnim == "eachCell") {
            drawEachCell(amountOfCells)
            divDrawEachCell(amountOfCells)
        } else if (selectedAnim == "totalRandom") {
            drawTotalRandom(amountOfCells)
            divDrawTotalRandom(amountOfCells)
        } else if (selectedAnim == "rows") {
            drawRows(amountOfCells, 0)
            divDrawRows(amountOfCells, 0)
        } else {
            var t0 = performance.now();
            justDraw(amountOfCells)
            var t1 = performance.now();
            divJustDraw(amountOfCells)
            var t2 = performance.now();
            console.log("Canvas: " + (t1 - t0) + "ms", "Pixelsize: " + pixelSize, "Pixelmargin: " + pixelMargin)
            console.log("Div: " + (t2 - t1) + "ms", "Pixelsize: " + pixelSize, "Pixelmargin: " + pixelMargin)
        }
    }, 1)
}

function calculateDivBox(amountOfCells) {
    mainDiv.innerHTML = null
    mainDiv.style['grid-template'] = "repeat(" + amountOfCells + ", " + pixelSize + "px) / repeat(" + amountOfCells + ", " + pixelSize + "px)"
    mainDiv.style['gap'] = pixelMargin + "px"

    for (let y = 0; y < amountOfCells; y++) {
        for (let x = 0; x < amountOfCells; x++) {
            const cell = document.createElement("div")
            cell.className = "div-cell"
            cell.id = "cell_" + x + "_" + y
            cell.style.width = pixelSize + "px"
            cell.style.height = pixelSize + "px"
            mainDiv.appendChild(cell)
        }
    }
}

function drawLoading() {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.textAlign = "center"
    context.fillStyle = "black"
    context.font = "32px arial"
    context.fillText("Loading...", canvas.width / 2, canvas.height / 2);
}

function divJustDraw(amountOfCells) {
    for (let y = 0; y < amountOfCells; y++) {
        for (let x = 0; x < amountOfCells; x++) {
            drawDivSquare(x, y);
        }
    }
}

function justDraw(amountOfCells) {
    for (let y = 0; y < amountOfCells; y++) {
        for (let x = 0; x < amountOfCells; x++) {
            drawSquare(x, y);
        }
    }
}

function divDrawRows(amountOfCells, y) {
    setTimeout(() => {
        for (let x = 0; x < amountOfCells; x++) {
            drawDivSquare(x, y)
        }
        if (y < amountOfCells - 1)
            divDrawRows(amountOfCells, y + 1)
    }, 1);
}
function drawRows(amountOfCells, y) {
    setTimeout(() => {
        for (let x = 0; x < amountOfCells; x++) {
            drawSquare(x, y)
        }
        if (y < amountOfCells - 1)
            drawRows(amountOfCells, y + 1)
    }, 1);
}

function divDrawEachCell(amountOfCells) {
    var cells = new Array()
    for (let y = 0; y < amountOfCells; y++) {
        for (let x = 0; x < amountOfCells; x++) {
            cells.push([x, y])
        }
    }

    const id = setInterval(() => {
        if (cells.length > 0) {
            const cell = cells.shift()
            drawDivSquare(cell[0], cell[1])
        }
        else
            clearInterval(id)
    }, 1);
}
function drawEachCell(amountOfCells) {
    var cells = new Array()
    for (let y = 0; y < amountOfCells; y++) {
        for (let x = 0; x < amountOfCells; x++) {
            cells.push([x, y])
        }
    }

    const id = setInterval(() => {
        if (cells.length > 0) {
            const cell = cells.shift()
            drawSquare(cell[0], cell[1])
        }
        else
            clearInterval(id)
    }, 1);
}

function divDrawTrickleDown(amountOfCells) {
    var lineArr = []
    for (let i = 0; i < amountOfCells; i++) {
        lineArr.push(i)
    }
    const rows = Array.from(lineArr)

    const id = setInterval(() => {
        const len = rows.length
        if (len > 0) {
            const row = Array.from(lineArr)
            row.forEach(x => {
                setTimeout(() => {
                    drawDivSquare(x, (lineArr.length - len));
                }, Math.floor(Math.random() * 500));
            });
            rows.pop()
        }
        else
            clearInterval(id)
    }, 30);
}
function drawTrickleDown(amountOfCells) {
    var lineArr = []
    for (let i = 0; i < amountOfCells; i++) {
        lineArr.push(i)
    }
    const rows = Array.from(lineArr)

    const id = setInterval(() => {
        const len = rows.length
        if (len > 0) {
            const row = Array.from(lineArr)
            row.forEach(x => {
                setTimeout(() => {
                    drawSquare(x, (lineArr.length - len));
                }, Math.floor(Math.random() * 500));
            });
            rows.pop()
        }
        else
            clearInterval(id)
    }, 30);
}

function divDrawTotalRandom(amountOfCells) {
    for (let y = 0; y < amountOfCells; y++) {
        for (let x = 0; x < amountOfCells; x++) {
            setTimeout(() => {
                drawDivSquare(x, y);
            }, Math.floor(Math.random() * (4000 / amountOfCells)));
        }
    }
}
function drawTotalRandom(amountOfCells) {
    for (let y = 0; y < amountOfCells; y++) {
        for (let x = 0; x < amountOfCells; x++) {
            setTimeout(() => {
                drawSquare(x, y);
            }, Math.floor(Math.random() * (4000 / amountOfCells)));
        }
    }
}

function drawDivSquare(x, y) {
    // Get first box-pixel-color
    const imageData = original.getImageData(x * (pixelMargin + pixelSize), y * (pixelMargin + pixelSize), pixelSize, pixelSize);
    const pixels = imageData.data;
    const firstPxl = pixels.slice(0, 3)

    const colorMode = document.querySelector("input[name='colorMode']:checked").value
    if (colorMode == "firstColor") {
        var avgColors = firstPxl // Just use first pixel instead of avg of first+last
    } else {
        const lastPxl = pixels.slice(-4)
        var avgColors = [(firstPxl[0] + lastPxl[0]) / 2, (firstPxl[1] + lastPxl[1]) / 2, (firstPxl[2] + lastPxl[2]) / 2,]
    }

    // Draw div
    const div = document.querySelector("#cell_" + x + "_" + y)
    const colorString = "rgb(" + avgColors.join(",") + ")"
    div.style.backgroundColor = colorString
}

function drawSquare(x, y) {
    // Get first box-pixel-color
    const imageData = original.getImageData(x * (pixelMargin + pixelSize), y * (pixelMargin + pixelSize), pixelSize, pixelSize);
    const pixels = imageData.data;
    const firstPxl = pixels.slice(0, 3)

    const colorMode = document.querySelector("input[name='colorMode']:checked").value
    if (colorMode == "firstColor") {
        var avgColors = firstPxl // Just use first pixel instead of avg of first+last
    } else {
        const lastPxl = pixels.slice(-4)
        var avgColors = [(firstPxl[0] + lastPxl[0]) / 2, (firstPxl[1] + lastPxl[1]) / 2, (firstPxl[2] + lastPxl[2]) / 2,]
    }

    // Draw rectangles
    const colorString = "rgb(" + avgColors.join(",") + ")"
    context.fillStyle = colorString;
    context.fillRect(x * (pixelMargin + pixelSize), y * (pixelMargin + pixelSize), pixelSize, pixelSize)
}

function canvasMouseOver(event) {
    // Get pixel color
    const rect = canvas.getBoundingClientRect()
    const xPos = event.clientX - rect.left
    const yPos = event.clientY - rect.top
    const pixel = context.getImageData(xPos, yPos, 1, 1).data.slice(0, 3)
    const colorString = "rgb(" + pixel.join(", ") + ")"

    // Show div at mouse
    if (pixel.filter(p => p == 0).length != 3) {
        const mouseDiv = document.querySelector("#color-div")
        mouseDiv.textContent = colorString.toUpperCase()
        mouseDiv.style.backgroundColor = colorString
        mouseDiv.style.left = String(event.pageX + 15) + "px"
        mouseDiv.style.top = String(event.pageY + 15) + "px"
        mouseDiv.style.display = "block";

        // if dark pixel show white text
        if (pixel.filter(p => p < 130).length == 3)
            mouseDiv.style.color = "white"
        else
            mouseDiv.style.color = "black"
    }
}