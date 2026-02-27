const apiURL = "https://rahulsagarindian.bsite.net/api/jobportal/getjob";

let jobs = [];
let filteredJobs = [];
let currentPage = 1;
let rowsPerPage = 10;

/* DOM Elements */
const tableBody = document.querySelector("#jobTable tbody");
const searchInput = document.getElementById("searchInput");
const rowsSelect = document.getElementById("rowsPerPage");
const pageSelect = document.getElementById("pageSelect");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

/* Fetch Data */
async function fetchJobs() {
    try {
        const res = await fetch(apiURL);
        const result = await res.json();
        // Ensure API success
        if (result.statusCode !== 200 || !result.data) {
            console.error("Invalid API response");
            return;
        }
        jobs = result.data.map((item) => ({
            title: item.jobTitle,
            company: item.companyName,
            location: item.jobLocation,        // fixed
            salary: item.jobSalary ?? 0,       // optional fallback
            description: item.jobDescription,
            applyLink: item.jobApplyLink,
            companyWebsite:item.companyWebsite,
            jobPublisher:item.jobPublisher,
            jobPostedAt:item.jobPostedAt,
            applyOptions: item.applyOptions || []
        }));
        filteredJobs = jobs;
        render();
    } catch (err) {
        console.error("Error fetching jobs:", err);
    }
}

/* Main Render Function */
function render() {
    displayJobs();
    setupPagination();
}

/* Display Jobs */
function displayJobs() {
    tableBody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filteredJobs.slice(start, start + rowsPerPage);

    paginated.forEach(job => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${job.title}</td>
            <td>${job.company}</td>
            <td>${job.location}</td>
            <td>${job.jobPublisher}</td>
            <td>${job.jobPostedAt}</td>
            <td><button class="view-btn">View</button></td>
        `;

        row.querySelector(".view-btn")
            .addEventListener("click", () => openModal(job));

        tableBody.appendChild(row);
    });
}

/* Pagination Setup */
function setupPagination() {
    const totalRecords = filteredJobs.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    // Page dropdown
    pageSelect.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const option = new Option(i, i);
        if (i === currentPage) option.selected = true;
        pageSelect.add(option);
    }

    // Page Info
    const start = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, totalRecords);
    pageInfo.textContent = `${start} - ${end} of ${totalRecords}`;

    // Arrow state
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

/* Search */
searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(value) ||
        job.company.toLowerCase().includes(value) ||
        job.location.toLowerCase().includes(value)
    );

    currentPage = 1;
    render();
});

/* Rows Per Page */
rowsSelect.addEventListener("change", () => {
    rowsPerPage = +rowsSelect.value;
    currentPage = 1;
    render();
});

/* Page Dropdown */
pageSelect.addEventListener("change", () => {
    currentPage = +pageSelect.value;
    render();
});

/* Arrows */
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        render();
    }
});

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredJobs.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        render();
    }
});


const modal = document.getElementById("jobModal");
const closeBtn = document.querySelector(".close");
const applyBtn = modal.querySelectorAll(".apply-btn");

function openModal(job) {

    document.getElementById("modalTitle").innerText = job.title;
    document.getElementById("modalLocation").innerText = job.location;
    document.getElementById("modalSalary").innerText = job.salary;
    document.getElementById("modalDescription").innerText = job.description;

    const companyLink = document.getElementById("modalCompany");
    companyLink.innerText = job.company;

    if (job.companyWebsite) {
        companyLink.href = job.companyWebsite;
        companyLink.target = "_blank";
        companyLink.style.pointerEvents = "auto";
        companyLink.style.color = "#007bff";
    } else {
        companyLink.removeAttribute("href");
        companyLink.style.pointerEvents = "none";
        companyLink.style.color = "#555";
    }

    // ✅ MULTIPLE APPLY BUTTONS LOGIC
    const container = document.getElementById("applyButtonsContainer");
    container.innerHTML = ""; // reset

    if (job.applyOptions.length > 0) {

        job.applyOptions.forEach(option => {

            const btn = document.createElement("button");
            btn.className = "apply-btn";
            btn.innerText = `Apply on ${option.publisher}`;
            btn.onclick = () => {
                window.open(option.apply_link, "_blank");
            };

            container.appendChild(btn);
        });

    } else if (job.applyLink) {
        // fallback if no applyOptions

        const btn = document.createElement("button");
        btn.className = "apply-btn";
        btn.innerText = job.jobPublisher 
            ? `Apply on ${job.jobPublisher}` 
            : "Apply Now";

        btn.onclick = () => {
            window.open(job.applyLink, "_blank");
        };

        container.appendChild(btn);
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}


/* Open Modal */
// function openModal(job) {

//     document.getElementById("modalTitle").innerText = job.title;
//     document.getElementById("modalLocation").innerText = job.location;
//     document.getElementById("modalSalary").innerText = job.salary;
//     document.getElementById("modalDescription").innerText = job.description;
//     const companyLink = document.getElementById("modalCompany");
//     companyLink.innerText = job.company;
//     if (job.companyWebsite) {
//         companyLink.href = job.companyWebsite;
//         companyLink.target = "_blank";
//         companyLink.style.pointerEvents = "auto";
//         companyLink.style.color = "#007bff";
//     } else {
//         companyLink.removeAttribute("href");
//         companyLink.style.pointerEvents = "none";
//         companyLink.style.color = "#555";
//     }

//     // applyBtn.onclick = () => window.open(job.applyLink, "_blank");
//     applyBtn.forEach(btn => {

//     // ✅ Text pehle set karo
//         if (job.jobPublisher) {
//             btn.innerText = `Apply on ${job.jobPublisher}`;
//         } else {
//             btn.innerText = "Apply Now";
//         }

//         // ✅ Dataset me link store karo
//         btn.dataset.link = job.applyLink || "";

//     });
//     modal.classList.add("active");

//     // Disable background scroll
//     document.body.style.overflow = "hidden";
// }
document.addEventListener("click", function (e) {

    if (e.target.classList.contains("apply-btn")) {

        const link = e.target.dataset.link;

        if (link) {
            window.open(link, "_blank");
        }
    }

});
/* Close Modal Function */
function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
}

/* Close Button */
closeBtn.addEventListener("click", closeModal);

/* Close When Clicking Outside */
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

/* Close On ESC Key */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
        closeModal();
    }
});

/* Init */

fetchJobs();
