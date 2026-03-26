// const apiBaseURL = "https://localhost:7056/api/jobportal/getjobs";//Local
const apiBaseURL = "https://rahulsagarindian.bsite.net/api/jobportal/getjobs";

let jobs = [];
let currentPage = 1;
let rowsPerPage = 10;
let total = 0;

// Cursor-based pagination state (to track where we are for the API)
let lastId = null;
let lastPostedAt = null;
let paginationStack = []; 

/* DOM Elements */
const tableBody = document.querySelector("#jobTable tbody");
const searchInput = document.getElementById("searchInput");
const rowsSelect = document.getElementById("rowsPerPage");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const modal = document.getElementById("jobModal");
const closeBtn = document.querySelector(".close");
const pageSelect = document.getElementById("pageSelect");

/* Fetch Data from API */
async function fetchJobs() {
    try {
        // Construct the URL with dynamic Query Parameters
        let url = new URL(apiBaseURL);
        url.searchParams.append("PageSize", rowsPerPage);

        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            url.searchParams.append("Search", searchTerm);
        }

        if (lastId && lastPostedAt) {
            url.searchParams.append("LastId", lastId);
            url.searchParams.append("LastPostedAt", lastPostedAt);
        }

        if (lastId && lastPostedAt) {
            url.searchParams.append("LastId", lastId);
            url.searchParams.append("LastPostedAt", lastPostedAt);
        }

        const res = await fetch(url.toString());
        const result = await res.json();

        if (result.statusCode === 200 && result.data) {
            // Map API response to our local structure
            jobs = result.data.jobs.map((item) => ({
                id: item.id, // Assuming jobId exists for LastId param
                title: item.jobTitle,
                company: item.companyName,
                location: item.jobLocation,
                description: item.jobDescription,
                applyLink: item.jobApplyLink,
                jobPublisher: item.jobPublisher,
                jobPostedAt: item.jobPostedAt,
                lastPostedAt:item.lastPostedAt
            }));

            total = result.data.count;
            render();
        } else {
            console.error("Invalid API response", result);
        }
    } catch (err) {
        console.error("Error fetching jobs:", err);
    }
}

/* Main Render Function */
function render() {
    displayJobs();
    updatePaginationUI();
}

/* Display Jobs (No more .slice() - API returns exactly what we need) */
function displayJobs() {
    tableBody.innerHTML = "";

    if (jobs.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No jobs found.</td></tr>";
        return;
    }

    jobs.forEach(job => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${job.title}</td>
            <td>${job.company}</td>
            <td>${job.location}</td>
            <td>${job.jobPublisher || 'N/A'}</td>
            <td>${job.jobPostedAt}</td>
            <td><button class="view-btn">View</button></td>
        `;

        row.querySelector(".view-btn").addEventListener("click", () => openModal(job));
        tableBody.appendChild(row);
    });
}

/* Pagination UI Logic */
function updatePaginationUI() {
    const totalPages = Math.ceil(total / rowsPerPage);
    
    // Page Info text
    const start = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, total);
    pageInfo.textContent = `${start} - ${end} of ${total}`;

    // Enable/Disable buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages || jobs.length < rowsPerPage;
    // Page dropdown
    pageSelect.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const option = new Option(i, i);
        if (i === currentPage) option.selected = true;
        pageSelect.add(option);
    }
}

/* --- Event Listeners --- */

// 1. Search (Server-side)
let searchTimeout;
searchInput.addEventListener("input", () => {
    // Debounce to avoid hitting API on every keystroke
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        lastId = null;
        lastPostedAt = null;
        paginationStack = [];
        fetchJobs();
    }, 500);
});

// 2. Rows Per Page
rowsSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(rowsSelect.value);
    currentPage = 1;
    lastId = null;
    lastPostedAt = null;
    paginationStack = [];
    fetchJobs();
});

// 3. Next Button (Uses Cursor Pagination)
nextBtn.addEventListener("click", () => {
    if (jobs.length > 0) {
        // Save current cursors to stack so we can go back
        paginationStack.push({ id: lastId, date: lastPostedAt });

        const lastJob = jobs[jobs.length - 1];
        lastId = lastJob.id;
        lastPostedAt = lastJob.lastPostedAt;
        
        currentPage++;
        fetchJobs();
    }
});

// 4. Previous Button
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        const prevCursors = paginationStack.pop();
        lastId = prevCursors.id;
        lastPostedAt = prevCursors.date;

        currentPage--;
        fetchJobs();
    }
});

/* Page Dropdown */
pageSelect.addEventListener("change", () => {
    const targetPage = parseInt(pageSelect.value);

    // If jumping to page 1, reset everything
    if (targetPage === 1) {
        lastId = null;
        lastPostedAt = null;
        paginationStack = [];
        currentPage = 1;
        fetchJobs();
        return;
    }
    
    if (targetPage === currentPage + 1) {
        // Equivalent to clicking "Next"
        nextBtn.click();
    } else if (targetPage === currentPage - 1) {
        // Equivalent to clicking "Previous"
        prevBtn.click();
    } else {
        // If they jump far away, we have to reset to start 
        // because we don't have the cursor for that specific page yet.
        alert("Direct page jumping is limited in cursor pagination. Returning to start.");
        lastId = null;
        lastPostedAt = null;
        paginationStack = [];
        currentPage = 1;
        fetchJobs();
    }
});

/* --- Modal Logic --- */
function openModal(job) {
    document.getElementById("modalTitle").innerText = job.title;
    document.getElementById("modalLocation").innerText = job.location;
    document.getElementById("modalDescription").innerText = job.description;
    
    const companyLink = document.getElementById("modalCompany");
    companyLink.innerText = job.company;

    const container = document.getElementById("applyButtonsContainer");
    container.innerHTML = ""; 

    if (job.applyLink) {
        const btn = document.createElement("button");
        btn.className = "apply-btn";
        btn.innerText = `Apply via ${job.jobPublisher || 'Source'}`;
        btn.onclick = () => window.open(job.applyLink, "_blank");
        container.appendChild(btn);
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
}

closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

/* Initialize */
fetchJobs();