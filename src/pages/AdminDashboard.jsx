import React, { useState, useEffect } from 'react';
import { jobApi } from '../services/api';
import BriefcaseIcon from '../components/BriefcaseIcon';

export default function AdminDashboard() {
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Pagination & Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    // Cursor State for Pagination
    const [lastId, setLastId] = useState(null);
    const [lastPostedAt, setLastPostedAt] = useState(null);
    const [paginationStack, setPaginationStack] = useState([]);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({
        jobTitle: '',
        companyName: '',
        jobLocation: '',
        jobDescription: '',
        jobApplyLink: '',
        jobPublisher: ''
    });

    // Debounced Search & Pagination Effect
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const delaySearch = setTimeout(() => {
                // Jab bhi search change ho, pagination reset karke API call karein
                if (searchTerm) {
                    resetPagination();
                }
                fetchJobs();
            }, 500); // 500ms debounce
            return () => clearTimeout(delaySearch);
        }
    }, [searchTerm, rowsPerPage, lastId]); // Re-run when these variables change

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const result = await jobApi.getJobs(rowsPerPage, searchTerm, lastId, lastPostedAt);

            if (result && result.statusCode === 200 && result.data) {
                setJobs(result.data.jobs || []);
                setTotal(result.data.count || 0);
            } else {
                setJobs([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("Error loading jobs:", error);
            setJobs([]);
        }
        setLoading(false);
    };

    /* --- Pagination Logic --- */
    const resetPagination = () => {
        setCurrentPage(1);
        setLastId(null);
        setLastPostedAt(null);
        setPaginationStack([]);
    };

    const handleNext = () => {
        if (jobs.length > 0) {
            const lastJob = jobs[jobs.length - 1];
            setPaginationStack([...paginationStack, { id: lastId, date: lastPostedAt }]);
            setLastId(lastJob.id);
            setLastPostedAt(lastJob.lastPostedAt);
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            const stackCopy = [...paginationStack];
            const prevCursors = stackCopy.pop();
            setPaginationStack(stackCopy);
            setLastId(prevCursors.id);
            setLastPostedAt(prevCursors.date);
            setCurrentPage(prev => prev - 1);
        }
    };

    const totalPages = Math.ceil(total / rowsPerPage);

    /* --- Form & CRUD Handlers --- */
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openCreateForm = () => {
        setEditingJob(null);
        setFormData({
            jobTitle: '', companyName: '', jobLocation: '',
            jobDescription: '', jobApplyLink: '', jobPublisher: ''
        });
        setIsFormOpen(true);
    };

    const openEditForm = (job) => {
        setEditingJob(job);
        setFormData({ ...job });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingJob) {
                await jobApi.updateJob(editingJob.id, formData);
            } else {
                await jobApi.createJob(formData);
            }
            setIsFormOpen(false);
            resetPagination(); // Reset karke fresh data load karo
            fetchJobs();
        } catch (error) {
            console.error("Error saving job", error);
            alert("Failed to save job.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await jobApi.deleteJob(id);
                resetPagination(); // Reset karke fresh data load karo
                fetchJobs();
            } catch (error) {
                console.error("Error deleting job", error);
            }
        }
    };

    return (
        <section className="container admin-container">
            {/* Header: Title, Search, and Add Button */}
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', paddingBottom: '20px' }}>

                {/* Left Side: Icon & Title */}
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <BriefcaseIcon className="page-icon" />
                    <h2>Admin Dashboard</h2>
                </div>

                {/* Right Side: Search Box & Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '280px', padding: '9px 15px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                    />

                    <button className="apply-btn" onClick={openCreateForm} style={{ margin: 0, whiteSpace: 'nowrap' }}>
                        + Add New Job
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="table-wrapper">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Company</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center' }}>No jobs found.</td></tr>
                            ) : (
                                jobs.map(job => (
                                    <tr key={job.id}>
                                        <td>{job.jobTitle}</td>
                                        <td>{job.companyName}</td>
                                        <td>{job.jobLocation}</td>
                                        {/* <td>
                                            <button onClick={() => openEditForm(job)} style={{ marginRight: '10px' }}>Edit</button>
                                            <button onClick={() => handleDelete(job.id)} style={{ backgroundColor: '#ff4d4d' }}>Delete</button>
                                        </td> */}
                                        <td className="action-buttons">
                                            <button
                                                className="icon-btn edit-btn"
                                                onClick={() => openEditForm(job)}
                                                title="Edit"
                                            >
                                                {/* Pencil Icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>

                                            <button
                                                className="icon-btn delete-btn"
                                                onClick={() => handleDelete(job.id)}
                                                title="Delete"
                                            >
                                                {/* Trash/Delete Icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && jobs.length > 0 && (
                <div className="custom-pagination">
                    <div className="rows-select">
                        Show Rows:
                        <select value={rowsPerPage} onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            resetPagination();
                        }}>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="150">150</option>
                        </select>
                    </div>
                    <div className="page-info">
                        Page {currentPage} - {totalPages} of {total || 1}
                    </div>
                    <div className="arrow-controls">
                        <button disabled={currentPage === 1} onClick={handlePrev}>◀</button>&nbsp;&nbsp;
                        <button disabled={currentPage >= totalPages || jobs.length < rowsPerPage} onClick={handleNext}> ▶</button>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="modal active">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsFormOpen(false)}>&times;</span>
                        <h2>{editingJob ? "Edit Job" : "Add New Job"}</h2>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <input name="jobTitle" placeholder="Job Title" value={formData.jobTitle} onChange={handleInputChange} required />
                            <input name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} required />
                            <input name="jobLocation" placeholder="Location" value={formData.jobLocation} onChange={handleInputChange} required />
                            <input name="jobPublisher" placeholder="Publisher" value={formData.jobPublisher} onChange={handleInputChange} />
                            <input name="jobApplyLink" placeholder="Application URL" value={formData.jobApplyLink} onChange={handleInputChange} />
                            <textarea name="jobDescription" placeholder="Job Description" value={formData.jobDescription} onChange={handleInputChange} required rows="5" />
                            <button type="submit" className="apply-btn">
                                {editingJob ? "Update Job" : "Save Job"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}