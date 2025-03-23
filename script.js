
let totalQuestions, columns, timeLeft, startQuestionNumber;
let userAnswers, answered, startTime;
let timer;

document.getElementById("startExamButton").addEventListener("click", function () {
    totalQuestions = parseInt(document.getElementById("totalQuestions").value);
    timeLeft = parseInt(document.getElementById("timeLeft").value);
    startQuestionNumber = parseInt(document.getElementById("startQuestionNumber").value);

    // কলাম সংখ্যা ১ এ ফিক্সড
    columns = 1;

    if (isNaN(totalQuestions) || isNaN(timeLeft) || isNaN(startQuestionNumber)) {
        alert("Please fill all fields with valid numbers.");
        return;
    }

    document.querySelector(".config-section").style.display = "none";
    document.getElementById("timer").style.display = "block";
    document.getElementById("toggleButton").style.display = "block";
    document.getElementById("imageUpload").style.display = "block";
    document.getElementById("lockButton").style.display = "block";
    document.getElementById("submit-btn").style.display = "block";

    initializeExam();
});

function initializeExam() {
    const questionsPerColumn = totalQuestions / columns;
    const container = document.getElementById("answer-sheet");
    const tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");

    userAnswers = new Array(totalQuestions).fill(null);
    answered = new Set();
    startTime = new Date();

    window.onbeforeunload = function () {
        return "আপনি কি নিশ্চিত যে আপনি পেজ রিফ্রেশ করতে চান? আপনার এক্সামের তথ্য হারিয়ে যেতে পারে।";
    };

    const fragment = document.createDocumentFragment();

    for (let col = 0; col < columns; col++) {
        const table = document.createElement("table");
        table.classList.add("table");

        let tableHTML = `<tr><th>Q No.</th><th>Answer</th></tr>`;

        for (let i = 0; i < questionsPerColumn; i++) {
            let qNum = i + startQuestionNumber + col * questionsPerColumn;

            tableHTML += `
                <tr>
                    <td style="color:red;font-weight:550;">${qNum}</td>
                    <td>
                        <span class="circle" data-q="${qNum}" data-ans="a">A</span>
                        <span class="circle" data-q="${qNum}" data-ans="b">B</span>
                        <span class="circle" data-q="${qNum}" data-ans="c">C</span>
                        <span class="circle" data-q="${qNum}" data-ans="d">D</span>
                    </td>
                </tr>
            `;
        }

        table.innerHTML = tableHTML;
        fragment.appendChild(table);
    }

    tableContainer.appendChild(fragment);
    container.appendChild(tableContainer);

    document.querySelectorAll(".circle").forEach(circle => {
        circle.addEventListener("click", function () {
            const qNum = this.getAttribute("data-q");
            const qNumIndex = parseInt(qNum) - startQuestionNumber;

            if (qNumIndex < 0 || qNumIndex >= totalQuestions) return;

            if (answered.has(qNumIndex)) return;

            const ans = this.getAttribute("data-ans");
            userAnswers[qNumIndex] = ans;
            answered.add(qNumIndex);

            this.parentElement.querySelectorAll(".circle").forEach(c => c.classList.remove("selected"));
            this.classList.add("selected");
            this.style.background = "black";
            this.style.color = "white";
        });
    });

    const timerElement = document.getElementById("time");

    function updateTimer() {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerElement.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        timeLeft--;

        if (timeLeft < 0) {
            window.onbeforeunload = null;
            document.getElementById("submit-btn").click();
            clearInterval(timer);
        }
    }

    timer = setInterval(updateTimer, 1000);
}

document.getElementById("submit-btn").addEventListener("click", function (event) {
    if (timeLeft > 0) {
        let confirmSubmit = confirm("আপনি কি নিশ্চিত যে আপনি পরীক্ষাটি জমা দিতে চান?");
        if (!confirmSubmit) {
            event.preventDefault();
            return;
        }
    }

    let endTime = new Date();
    clearInterval(timer);
    document.getElementById("timer").innerText = "Exam Finished!";

    document.querySelectorAll(".circle").forEach(circle => {
        circle.style.pointerEvents = "none";
    });

    document.getElementById("answer-section").style.display = "block";
    document.getElementById("submit-btn").style.display = "none";
});

document.getElementById("initialize-btn").addEventListener("click", function () {
    let userCorrectAnswers = document.getElementById("userAnswers").value.trim();

    if (userCorrectAnswers.length !== totalQuestions) {
        alert("আপনার দেওয়া উত্তর অবশ্যই " + totalQuestions + " অক্ষরের হতে হবে!");
        return;
    }
    if (!/^[abcd]+$/.test(userCorrectAnswers)) {
        alert("শুধুমাত্র a, b, c, d ব্যবহার করতে পারবেন! অন্য কোনো অক্ষর দেওয়া যাবে না।");
        return;
    }

    let confirmInitialize = confirm("আপনি কি নিশ্চিত যে আপনি মার্কিং শুরু করতে চান?");
    if (!confirmInitialize) {
        return;
    }

    let score = 0, wrong = 0;
    let negativeMarking = 0;

    for (let i = 0; i < totalQuestions; i++) {
        let qNum = i + startQuestionNumber;
        let selectedCircle = document.querySelector(`.circle[data-q="${qNum}"].selected`);
        let correctAns = userCorrectAnswers[i];
        let correctCircle = document.querySelector(`.circle[data-q="${qNum}"][data-ans="${correctAns}"]`);

        if (selectedCircle) {
            let chosenAns = selectedCircle.getAttribute("data-ans");
            if (chosenAns === correctAns) {
                selectedCircle.style.background = "green";
                selectedCircle.style.border = "1px solid green";
                score++;
            } else {
                wrong++;
                selectedCircle.style.background = "red";
                selectedCircle.style.border = "1px solid red";
                if (correctCircle) {
                    correctCircle.style.background = "rgba(104, 255, 99, 0.33)";
                    correctCircle.style.border = "1px solid green";
                    correctCircle.style.color = "black";
                }
            }
        } else {
            if (correctCircle) {
                correctCircle.style.border = "1px solid darkblue";
                correctCircle.style.backgroundColor = "rgba(206, 206, 206, 0.88)";
                correctCircle.style.color = "darkblue";
            }
        }
    }

    negativeMarking = wrong * 0.25;
    let finalScore = score - negativeMarking;

    document.getElementById("result").innerHTML = `
        <h2 id="examHeader" style="color:darkgreen;">Exam Summary</h2>
        <div style="text-align:left;border:1px solid green;padding:2%;border-radius:7px;background:rgb(75 255 4 / 5%);">
            <p>You Obtained:<strong style="color:red;"> ${finalScore} / ${totalQuestions}</strong></p>
            <p>Total Wrong: <strong style="color:red;font-size:16px;"> ${wrong}</strong></p>
            <p>Total Negative Marking:<strong style="color:red;font-size:16px;"> ${negativeMarking.toFixed(2)}</strong></p>
        </div>
    `;

    document.getElementById("initialize-btn").disabled = true;
    document.getElementById("initialize-btn").style.background = "gray";
    document.getElementById("answer-section").style.display = "none";
    document.getElementById("initialize-btn").style.display = "none";
});

const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const lockButton = document.getElementById("lockButton");

let isLocked = false;

imageUpload.addEventListener("change", function () {
    if (isLocked) return;

    imagePreview.innerHTML = "";

    const files = imageUpload.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.width = "200%";
            img.style.height = "200%";
            img.style.margin = "5px";
            imagePreview.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
});

lockButton.addEventListener("click", function () {
    if (imagePreview.children.length === 0) {
        alert("Please upload at least one image before locking!");
        return;
    }

    isLocked = true;
    imageUpload.style.display = "none";
    lockButton.style.background = "gray";
    lockButton.innerText = "Images Locked";
    lockButton.disabled = true;
    lockButton.style.display = "none";
});

document.getElementById("userAnswers").addEventListener("input", function () {
    this.value = this.value.toLowerCase();
});
