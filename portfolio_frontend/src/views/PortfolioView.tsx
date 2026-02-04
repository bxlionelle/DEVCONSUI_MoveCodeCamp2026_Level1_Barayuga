import { useState, useEffect } from "react"

// ============================================================================
// PORTFOLIO DATA CONFIGURATION
// ============================================================================
const defaultPortfolioData = {
  name: "LADY DIANE BAUZON CASILANG",
  course: "BS in Information Technology",
  school: "FEU Institute of Technology",
  about: "I am a fourth-year IT student and freelance designer who integrates technical troubleshooting with creative insight to deliver innovative, efficient solutions.",
  skills: [
    "Graphic Design",
    "UI / UX Design",
    "Project Management",
    "Full Stack Development",
    "Web & App Development"
  ],
  linkedin: "https://www.linkedin.com/in/ldcasilang/",
  github: "https://github.com/ldcasilang",
}

// Network configuration
const NETWORKS = {
  testnet: {
    name: "Testnet",
    fullnode: "https://fullnode.testnet.sui.io",
    explorer: "https://suiscan.xyz/testnet",
  },
  mainnet: {
    name: "Mainnet",
    fullnode: "https://fullnode.mainnet.sui.io",
    explorer: "https://suiscan.xyz/mainnet",
  }
};

const PortfolioView = () => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  const objectId = "0xdfc11c96b52ea7d4ae2d05bd0c375e81938933f1f8621a9c14a3aaca66999dc8";
  
  // Network state - default to testnet, can be changed if needed
  const [currentNetwork, setCurrentNetwork] = useState<"testnet" | "mainnet">("testnet");
  
  const [portfolioData, setPortfolioData] = useState(defaultPortfolioData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================================
  // FETCH DATA FROM BLOCKCHAIN
  // ==========================================================================
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setIsLoading(true);
        
        const network = NETWORKS[currentNetwork];
        
        const response = await fetch(
          network.fullnode,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getObject',
              params: [
                objectId,
                {
                  showContent: true,
                  showOwner: true,
                  showPreviousTransaction: true,
                  showStorageRebate: true,
                  showDisplay: false,
                  showBcs: false,
                  showType: true
                }
              ]
            })
          }
        );

        const result = await response.json();
       
        if (result.error) {
          throw new Error(result.error.message || "Failed to fetch from blockchain");
        }
        
        if (result.result?.data?.content?.fields) {
          const fields = result.result.data.content.fields;
         
          const newPortfolioData = {
            name: fields.name || defaultPortfolioData.name,
            course: fields.course || defaultPortfolioData.course,
            school: fields.school || defaultPortfolioData.school,
            about: fields.about || defaultPortfolioData.about,
            linkedin: fields.linkedin_url || defaultPortfolioData.linkedin,
            github: fields.github_url || defaultPortfolioData.github,
            skills: fields.skills || defaultPortfolioData.skills,
          };
          
          setPortfolioData(newPortfolioData);
        } else {
          throw new Error("No portfolio data found in object");
        }
      } catch (err) {
        console.log("Using default data. Blockchain fetch failed:", err);
        setError(`Note: Using default data (blockchain fetch failed: ${err instanceof Error ? err.message : 'Unknown error'})`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [objectId, currentNetwork]);

  // Network toggle handler (optional - you can remove if you don't need network switching)
  const toggleNetwork = () => {
    setCurrentNetwork(prev => prev === "testnet" ? "mainnet" : "testnet");
  };

  // ==========================================================================
  // COMPONENT RENDER - MAIN PORTFOLIO LAYOUT
  // ==========================================================================
  return (
    <>
      {/* Loading indicator */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#667eea',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          Loading from {NETWORKS[currentNetwork].name}...
        </div>
      )}

      {/* Network indicator */}
      {/* <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: currentNetwork === 'testnet' ? '#f97316' : '#10b981',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }} onClick={toggleNetwork}>
        {currentNetwork.toUpperCase()} • Click to switch
      </div> */}

      {/* Error message */}
      {error && (
        <div style={{
          background: "#fff3cd",
          color: "#856404",
          padding: "1rem",
          margin: "1rem",
          borderRadius: "8px",
          border: "1px solid #ffeaa7",
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ===================================================================== */}
      {/* HERO SECTION - Profile and Introduction */}
      {/* ===================================================================== */}
      <div className="hero-wrapper">
        <div className="hero">
          {/* Profile Image - Static local image only */}
          <div className="avatar">
            <img
              src="/profile.png"
              alt={portfolioData.name}
              crossOrigin="anonymous"
              style={{
                border: "none",
                opacity: 1
              }}
            />
          </div>

          {/* Personal Information */}
          <div className="hero-content">
            <small>Hello! My name is</small>
            <h1 className="gradient-name">{portfolioData.name}</h1>
            <p><span className="degree">{portfolioData.course}, {portfolioData.school}</span></p>

            {/* Social Media Links */}
            <div className="socials">
              <a
                href={portfolioData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-linkedin"></i> LinkedIn
              </a>
              <a
                href={portfolioData.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-github"></i> GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ABOUT ME & SKILLS SECTION */}
      {/* ===================================================================== */}
      <section className="solid-section">
        <h2>About Me</h2>
        <p>
          {portfolioData.about}
        </p>

        <h2>Skills</h2>
        {/* Skills Grid - Maps through skills array */}
        <div className="skills">
          {portfolioData.skills.map((skill, index) => (
            <div key={index} className="skill">{skill}</div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* MOVE SMART CONTRACTS - Educational Section */}
      {/* ===================================================================== */}
      <div className="move-wrapper">
        <div className="move-card">
          <div className="move-title">
            <img src="/sui-logo.png" alt="Move Logo" className="move-logo" />
            <strong>Move Smart Contracts</strong>
          </div>

          {/* Educational Content about Move Language */}
          <p>
            Move smart contracts are programs written in the Move language and deployed on blockchains like Sui, enabling secure asset management and high scalability. As a secure and efficient language designed for apps that scale, Move ushers in a new era of smart contract programming by offering significant advancements in security and productivity. Move drastically reduces the Web3 learning curve and enables a developer experience of unprecedented ease, serving as the foundation for Sui, a high-performance Layer 1 blockchain that utilizes an object-centric data model to achieve industry-leading transaction speeds.
          </p>

          {/* External Link to Official Sui Documentation */}
          <a href="https://www.sui.io/move" target="_blank" className="learn-more-btn" rel="noopener noreferrer">
            Learn More About Sui →
          </a>
        </div>

        {/* Empty move-footer - Can be used for additional content if needed */}
        <div className="move-footer">
          <p></p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FOOTER - Attribution and Logos */}
      {/* ===================================================================== */}
      <div className="custom-footer">
        <div className="footer-container">
          {/* Organization Logos */}
          <div className="footer-logos">
            <img src="/devcon.png" alt="DEVCON" className="logo-img" />
            <img src="/sui.png" alt="SUI" className="logo-img" />
          </div>
        
          {/* Code Camp Attribution Text */}
          <div className="footer-text">
            <p style={{ 
              marginBottom: '0.8rem',
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              Portfolio project published during <strong>Move Smart Contracts Code Camp </strong>
              by DEVCON Philippines & SUI Foundation
            </p>
            
            {/* Project Deployment Links - Smaller and horizontal */}
            <div style={{
              display: "flex",
              gap: "0.8rem",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: "0.3rem"
            }}>
              {/* SuiScan Link */}
              <a 
                href={`${NETWORKS[currentNetwork].explorer}/object/${objectId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#6C8EEF',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(108, 142, 239, 0.3)',
                  backgroundColor: 'rgba(108, 142, 239, 0.05)',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(108, 142, 239, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(108, 142, 239, 0.05)';
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6C8EEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="#6C8EEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#6C8EEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                View on {currentNetwork === 'testnet' ? 'Testnet' : 'Mainnet'}
              </a>
              
              {/* Deployment Info */}
              <div style={{
                color: '#666',
                fontSize: '0.8rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid rgba(102, 102, 102, 0.2)',
                backgroundColor: 'rgba(102, 102, 102, 0.05)',
              }}>
                <strong>Object ID:</strong> {objectId.slice(0, 8)}...{objectId.slice(-6)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PortfolioView