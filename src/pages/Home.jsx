import React, { useState, useEffect } from 'react';
import { jobApi } from '../services/api';
import BriefcaseIcon from '../components/BriefcaseIcon';

export default function Home() {
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Pagination & Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(12); // Changed to 12 so rows of 3 are even
    const [currentPage, setCurrentPage] = useState(1);
    
    // Cursor State
    const [lastId, setLastId] = useState(null);
    const [lastPostedAt, setLastPostedAt] = useState(null);
    const [paginationStack, setPaginationStack] = useState([]);

    // Modal State
    const [selectedJob, setSelectedJob] = useState(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const result = await jobApi.getJobs(rowsPerPage, searchTerm, lastId, lastPostedAt);
            if (result.statusCode === 200 && result.data) {
                setJobs(result.data.jobs);
                setTotal(result.data.count);
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        }
        setLoading(false);
    };

    // Debounced Search
    useEffect(() => {
        debugger;
        const delaySearch = setTimeout(() => {
            // resetPagination();
            fetchJobs();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, rowsPerPage, lastId]);

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

    return (
        <div>
            <section className="hero">
                <div className="page-header center-header">
                    <BriefcaseIcon className="page-icon hero-icon" />
                    <h1>Find Your Dream Job Today</h1>
                </div>
                <input 
                    type="text" 
                    placeholder="Search by title, company, location..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </section>

            <section className="container home-card">
                {loading ? <div className="loader" style={{textAlign: 'center', padding: '20px'}}>Loading...</div> : (
                    
                    /* --- NEW CARD GRID LAYOUT --- */
                    <div className="job-grid">
                        {jobs.length === 0 ? (
                            <div className="no-jobs">No jobs found.</div>
                        ) : (
                            jobs.map(job => (
                                <div className="job-card" key={job.id}>
                                    {/* Gray Image Placeholder */}
                                    <div className="card-image">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                            <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                                        </svg>
                                        <span>No Image</span>
                                    </div>
                                    
                                    {/* Card Content */}
                                    <div className="card-content">
                                        <h3 className="card-title">{job.jobTitle}</h3>
                                        <div className="card-company">{job.companyName}</div>
                                        <div className="card-location">{job.jobLocation}</div>
                                        <div className="card-meta">
                                            {job.jobPublisher ? `${job.jobPublisher} • ` : ''} 
                                            {job.jobPostedAt}
                                        </div>
                                        <div className="card-actions">
                                            <button className="apply-btn" onClick={() => setSelectedJob(job)}>View</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    /* ---------------------------- */

                )}

                <div className="custom-pagination">
                    <div className="rows-select">
                        Show Rows: 
                        <select value={rowsPerPage} onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            resetPagination();
                        }}>
                            <option value="12">12</option>
                            <option value="24">24</option>
                            <option value="48">48</option>
                        </select>
                    </div>
                    <div className="page-info">
                        Page {currentPage} - {totalPages} of {total || 1}
                    </div>
                    <div className="arrow-controls">
                        <button disabled={currentPage === 1} onClick={handlePrev}>◀</button>&nbsp;&nbsp;
                        <button disabled={currentPage >= totalPages || jobs.length < rowsPerPage} onClick={handleNext}>▶</button>
                    </div>
                </div>
            </section>

            {/* Job Modal (Unchanged) */}
            {selectedJob && (
                <div className="modal active" onClick={() => setSelectedJob(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <span className="close" onClick={() => setSelectedJob(null)}>&times;</span>
                        <h2>{selectedJob.jobTitle}</h2>
                        <p><strong>Company:</strong> {selectedJob.companyName}</p>
                        <p><strong>Location:</strong> {selectedJob.jobLocation}</p>
                        <br />
                        <p><strong>Description:</strong> {selectedJob.jobDescription}</p>
                        <br />
                        {selectedJob.jobApplyLink && (
                            <button 
                                className="apply-btn" 
                                onClick={() => window.open(selectedJob.jobApplyLink, "_blank")}
                            >
                                Apply via {selectedJob.jobPublisher || 'Source'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}