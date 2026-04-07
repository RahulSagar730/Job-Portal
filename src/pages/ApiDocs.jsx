import React from 'react';
import BriefcaseIcon from '../components/BriefcaseIcon';

export default function ApiDocs() {
    // Apne backend ka Swagger URL yahan set karein.
    // Agar production me hain toh live URL use karein (e.g., https://rahulsagarindian.bsite.net/swagger/index.html)
    const swaggerUrl = "https://rahulsagarindian.bsite.net/swagger/index.html"; 

    return (
        <section className="container admin-container" style={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="admin-header" style={{ marginBottom: '15px' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <BriefcaseIcon className="page-icon" />
                    <h3>API Documentation (Swagger)</h3>
                </div>
            </div>
            
            {/* Iframe Container */}
            <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                <iframe 
                    src={swaggerUrl} 
                    title="Swagger API Documentation"
                    width="100%" 
                    height="100%" 
                    style={{ border: 'none' }}
                />
            </div>
        </section>
    );
}