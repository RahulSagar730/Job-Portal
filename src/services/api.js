const API_BASE_URL = "https://rahulsagarindian.bsite.net/api";
// const API_BASE_URL = "https://localhost:7056/api";

export const jobApi = {
    // Read (Public & Admin)
    getJobs: async (rowsPerPage, searchTerm, lastId, lastPostedAt) => {
        let url = new URL(`${API_BASE_URL}/jobportal/getjobs`);
        url.searchParams.append("PageSize", rowsPerPage);

        if (searchTerm) url.searchParams.append("Search", searchTerm);
        if (lastId && lastPostedAt) {
            url.searchParams.append("LastId", lastId);
            url.searchParams.append("LastPostedAt", lastPostedAt);
        }

        const response = await fetch(url.toString());
        return response.json();
    },

    // Create (Admin)
    createJob: async (jobData) => {
        const response = await fetch(`${API_BASE_URL}/jobportal/addjob`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });
        return response.json();
    },

    // Update (Admin)
    updateJob: async (id, jobData) => {
        const response = await fetch(`${API_BASE_URL}/jobportal/updatejob/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });
        return response.json();
    },

    // Delete (Admin)
    deleteJob: async (id) => {
        debugger;
        const response = await fetch(`${API_BASE_URL}/jobportal/deletejob?id=${id}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*'
            }
        });
        return response.json();
    },
    //***************************Auth Api******************************Auth Api*************************************
    //Login Api
    loginApi: async (data) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'text/plain'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        return result;
    },
    //Logout Api
    logoutApi: async () => {
        const username = localStorage.getItem("username");

        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "text/plain"
            },
            body: JSON.stringify({
                username: username
            })
        });
        const result = await response.json();
        return result;
    },
};