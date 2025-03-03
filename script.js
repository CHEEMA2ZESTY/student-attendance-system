// Select Elements
const attendanceForm = document.getElementById("attendance-form");
const studentNameInput = document.getElementById("student-name");
const matricNumberInput = document.getElementById("matric-number"); // Added Matric/Diploma Number
const statusSelect = document.getElementById("attendance-status");
const recordsTable = document.getElementById("attendance-records");
const searchInput = document.getElementById("search");
const progressBar = document.getElementById("attendance-progress");
const themeToggle = document.getElementById("theme-toggle");
const notification = document.getElementById("notification");

// Load Attendance Records from Local Storage
function loadRecords() {
    const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    recordsTable.innerHTML = "";

    records.forEach((record, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td contenteditable="true" onblur="editRecord(${index}, 'name', this.textContent)">${record.name}</td>
            <td contenteditable="true" onblur="editRecord(${index}, 'matricNumber', this.textContent)">${record.matricNumber}</td> <!-- Added Matric No -->
            <td>${record.date}</td>
            <td contenteditable="true" onblur="editRecord(${index}, 'status', this.textContent)" class="status-${record.status.toLowerCase()}">${record.status}</td>
            <td>
                <button onclick="deleteRecord(${index})" class="delete-btn">🗑️</button>
            </td>
        `;
        recordsTable.appendChild(row);
    });

    updateProgressBar();
}

// Save Attendance Data
if (attendanceForm) {
    attendanceForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = studentNameInput.value.trim();
        const matricNumber = matricNumberInput.value.trim(); // Capture Matric/Diploma Number
        const status = statusSelect.value;
        const date = new Date().toLocaleDateString();

        if (!name || !matricNumber) {
            showNotification("Please enter your name and matric/diploma number.", "error");
            return;
        }

        const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
        records.push({ name, matricNumber, date, status }); // Now storing matric number
        localStorage.setItem("attendanceRecords", JSON.stringify(records));

        studentNameInput.value = "";
        matricNumberInput.value = ""; // Clear Matric/Diploma Number field
        showNotification("Attendance recorded!", "success");

        loadRecords();
    });
}

// Edit Attendance Record
function editRecord(index, field, value) {
    const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    if (field === "status") {
        const validStatuses = ["Present", "Late", "Absent"];
        if (!validStatuses.includes(value)) {
            showNotification("Invalid status! Use Present, Late, or Absent.", "error");
            loadRecords();
            return;
        }
    }

    records[index][field] = value;
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
    showNotification("Record updated!", "success");
    loadRecords();
}

// Delete Attendance Record
function deleteRecord(index) {
    const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    records.splice(index, 1);
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
    showNotification("Record deleted!", "success");
    loadRecords();
}

// Search Attendance Records
function searchAttendance() {
    const filter = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#attendance-records tr");

    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const matricNumber = row.cells[1].textContent.toLowerCase(); // Include Matric/Diploma No in search
        row.style.display = name.includes(filter) || matricNumber.includes(filter) ? "" : "none";
    });
}

// Sort Records
let sortOrder = { name: true, status: true, matricNumber: true }; // Track sorting direction
function sortRecords(field) {
    let records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

    records.sort((a, b) => {
        const valA = a[field].toLowerCase();
        const valB = b[field].toLowerCase();

        if (valA < valB) return sortOrder[field] ? -1 : 1;
        if (valA > valB) return sortOrder[field] ? 1 : -1;
        return 0;
    });

    sortOrder[field] = !sortOrder[field]; // Toggle sorting direction
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
    showNotification(`Sorted by ${field}!`, "success");
    loadRecords();
}

// Update Attendance Progress Bar
function updateProgressBar() {
    const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    const total = records.length;
    const presentCount = records.filter(r => r.status === "Present").length;
    const progress = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;
    }
}

// Show Notification with Animation
function showNotification(message, type) {
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.opacity = "1";
        
        setTimeout(() => {
            notification.style.opacity = "0";
        }, 3000);
    }
}

// Dark Mode Toggle
if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
        localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });

    // Load saved theme preference
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
    }
}

// Load Records on Page Load
document.addEventListener("DOMContentLoaded", loadRecords);
