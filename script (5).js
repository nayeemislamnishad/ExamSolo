
const questionsPerColumn = totalQuestions / columns;
const container = document.getElementById("answer-sheet");
const tableContainer = document.createElement("div");
tableContainer.classList.add("table-container");

let userAnswers = new Array(totalQuestions).fill(null);
let answered = new Set();
let startTime = new Date();

window.onbeforeunload = function() {
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
        const qNum = this.getAttribute("data-q"); // প্রশ্ন নম্বর বের করা
        const qNumIndex = parseInt(qNum) - startQuestionNumber; // 76 থেকে শুরু হওয়া প্রশ্নের জন্য সঠিক ইনডেক্স পাওয়া

        if (qNumIndex < 0 || qNumIndex >= totalQuestions) return; // ভুল ইনডেক্স হলে কিছু করো না

        if (answered.has(qNumIndex)) return; // যদি আগেই উত্তর দেওয়া থাকে, তাহলে কিছু করো না

        const ans = this.getAttribute("data-ans");
        userAnswers[qNumIndex] = ans; // ইউজারের উত্তর সংরক্ষণ করা
        answered.add(qNumIndex); // প্রশ্নটাকে "answered" হিসেবে মার্ক করা

        // UI তে সিলেক্ট করা উত্তর হাইলাইট করা
        this.parentElement.querySelectorAll(".circle").forEach(c => c.classList.remove("selected"));
        this.classList.add("selected");
        this.style.background = "black";
        this.style.color = "white";
    });
});


document.getElementById("submit-btn").addEventListener("click", function (event) {
    if (timeLeft > 0) {
        let confirmSubmit = confirm("আপনি কি নিশ্চিত যে আপনি পরীক্ষাটি জমা দিতে চান?");
        if (!confirmSubmit) {
            event.preventDefault();
            return;
        }
    }

    let endTime = new Date();
    // ✅ **Timer বন্ধ করা**
    clearInterval(timer); // Timer বন্ধ করবে
    document.getElementById("timer").innerText = "Exam Finished!"; // Timer Text চেঞ্জ

    // **OMR Lock করা (User আর Answer Select করতে পারবে না)**
    document.querySelectorAll(".circle").forEach(circle => {
        circle.style.pointerEvents = "none";  // Lock OMR
    });

    // **Answer Input Box & Initialize Button দেখানো**
    document.getElementById("answer-section").style.display = "block";

    // **Submit Button Hide করা**
    document.getElementById("submit-btn").style.display = "none";
});







    
    document.getElementById("initialize-btn").addEventListener("click", function () {
    let userCorrectAnswers = document.getElementById("userAnswers").value.trim(); // User দেওয়া সঠিক উত্তর
    
    if (userCorrectAnswers.length !== totalQuestions) {
        alert("আপনার দেওয়া উত্তর অবশ্যই " + totalQuestions + " অক্ষরের হতে হবে!");
        return;
    }
    if (!/^[abcd]+$/.test(userCorrectAnswers)) {
        alert("শুধুমাত্র a, b, c, d ব্যবহার করতে পারবেন! অন্য কোনো অক্ষর দেওয়া যাবে না।");
        return;
    }
    // ✅ Check 3: **Final Confirmation**
    let confirmInitialize = confirm("আপনি কি নিশ্চিত যে আপনি মার্কিং শুরু করতে চান?");
    if (!confirmInitialize) {
        return; // ইউজার 'Cancel' চাপলে কিছুই হবে না
    }

    let score = 0, wrong = 0;
    let negativeMarking = 0;

    for (let i = 0; i < totalQuestions; i++) {
        let qNum = i + startQuestionNumber;
        let selectedCircle = document.querySelector(`.circle[data-q="${qNum}"].selected`);
        let correctAns = userCorrectAnswers[i]; // User দেওয়া সঠিক উত্তর
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

    // **Initialize Button Disabled করা**
    document.getElementById("initialize-btn").disabled = true;
    document.getElementById("initialize-btn").style.background = "gray";
    document.getElementById("answer-section").style.display="none";
    document.getElementById("nitialize-btn").style.display="none";
});


    


    


// let timeLeft = 1200;
const timerElement = document.getElementById("time");

function updateTimer() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timerElement.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    timeLeft--;

    if (timeLeft < 0) {
    window.onbeforeunload = null;  // Disable refresh warning during auto-submit
    document.getElementById("submit-btn").click();
        clearInterval(timer);
    }
}

const timer = setInterval(updateTimer, 1000);



const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const lockButton = document.getElementById("lockButton");

let isLocked = false; // Lock button চাপা হয়েছে কিনা চেক করতে

// User যখন ছবি আপলোড করবে
imageUpload.addEventListener("change", function () {
    if (isLocked) return; // যদি Lock করা থাকে, কিছুই হবে না

    imagePreview.innerHTML = ""; // আগের সব ছবি মুছে দাও

    const files = imageUpload.files; // ইউজার যে ফাইল আপলোড করেছে তা নেয়া
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function (e) {
    const img = document.createElement("img");
    img.src = e.target.result;
    
    // Image size বড় করে দেওয়া (তোমার আগের design-এর মতো)
    img.style.width = "200%";
    img.style.height = "200%";
    
    img.style.margin = "5px";
    imagePreview.appendChild(img);
};


        reader.readAsDataURL(file);
    }
});

// Lock button event
lockButton.addEventListener("click", function () {
    if (imagePreview.children.length === 0) {
        alert("Please upload at least one image before locking!");
        return;
    }

    isLocked = true;
    imageUpload.style.display = "none"; // Input box লুকিয়ে দাও
    lockButton.style.background = "gray"; // Lock button disabled দেখানো
    lockButton.innerText = "Images Locked"; // বাটনের টেক্সট পরিবর্তন করা
    lockButton.disabled = true;
    lockButton.style.display = "none";
});


document.getElementById("userAnswers").addEventListener("input", function () {
    this.value = this.value.toLowerCase(); // সব অক্ষর ছোট করে ফেলা
});
