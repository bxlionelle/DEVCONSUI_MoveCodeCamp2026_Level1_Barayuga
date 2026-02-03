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
  profile_photo_object_id: "",  // NEW FIELD
}

const PortfolioView = () => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  const objectId = "0xb474b6a440ba8ca4f06a3c46e7dd9529694c1cba12f3d83a59ece1fa0f643e25";
 
  const [portfolioData, setPortfolioData] = useState(defaultPortfolioData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("/profile.png");
  const [imageStatus, setImageStatus] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [walrusImageId, setWalrusImageId] = useState("");

  // ==========================================================================
  // HELPER: Fetch Walrus Image from Aggregator URL
  // ==========================================================================
  const fetchWalrusImage = async (walrusUrl: string) => {
    if (!walrusUrl || !walrusUrl.includes('walrus')) {
      return "/profile.png";
    }

    try {
      setImageStatus("Fetching from Walrus...");
      const response = await fetch(walrusUrl);
      
      if (response.ok) {
        const blob = await response.blob();
        
        if (blob.size > 0) {
          const objectUrl = URL.createObjectURL(blob);
          setImageStatus("✅ Loaded from Walrus!");
          return objectUrl;
        }
      }
      console.log("Walrus fetch failed, status:", response.status);
      return "/profile.png";
    } catch (err) {
      console.log("Walrus fetch error:", err);
      return "/profile.png";
    }
  };

  // ==========================================================================
  // HELPER: Process photo ID from blockchain
  // ==========================================================================
  const getImageUrlFromPhotoId = (photoId: string) => {
    if (!photoId) return "/profile.png";
    
    // Save the Walrus ID for the link
    if (photoId.startsWith('ud_')) {
      setWalrusImageId(photoId);
    }
    
    // If it's already a URL (Walrus Aggregator), use it
    if (photoId.startsWith('https://aggregator.walrus-testnet.walrus.space/')) {
      // Extract ID from URL
      const idFromUrl = photoId.split('/').pop();
      if (idFromUrl && idFromUrl.startsWith('ud_')) {
        setWalrusImageId(idFromUrl);
      }
      return photoId;
    }
    
    // If it's a blob ID (ud_ format), convert to Aggregator URL
    if (photoId.startsWith('ud_')) {
      return `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${photoId}`;
    }
    
    // If it's hex ID (0x), convert to Aggregator URL
    if (photoId.startsWith('0x')) {
      return `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${photoId}`;
    }
    
    return "/profile.png";
  };

  // ==========================================================================
  // FETCH DATA FROM BLOCKCHAIN
  // ==========================================================================
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setIsLoading(true);
        setImageStatus("Loading portfolio data...");
       
        const response = await fetch(
          `https://fullnode.testnet.sui.io`,
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
            profile_photo_object_id: fields.profile_photo_object_id || "",
          };
          
          setPortfolioData(newPortfolioData);
          
          // Load Walrus image if available
          if (newPortfolioData.profile_photo_object_id) {
            const walrusUrl = getImageUrlFromPhotoId(newPortfolioData.profile_photo_object_id);
            const imageUrl = await fetchWalrusImage(walrusUrl);
            setProfileImageUrl(imageUrl);
          } else {
            setImageStatus("No Walrus ID in contract");
          }
        }
      } catch (err) {
        console.log("Using default data. Blockchain fetch failed:", err);
        setError("Note: Using default data (blockchain fetch failed)");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [objectId]);

  // ==========================================================================
  // CHECK FOR LOCAL WALRUS PHOTO (fallback)
  // ==========================================================================
  useEffect(() => {
    // Check if walrus-photo.png exists in public folder (fallback)
    const img = new Image();
    img.onload = () => {
      console.log("Local walrus-photo.png available as fallback");
    };
    img.onerror = () => {
      // Not found, that's okay
    };
    img.src = "/walrus-photo.png";
  }, []);

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
          Loading from blockchain...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          background: "#fff3cd",
          color: "#856404",
          padding: "1rem",
          margin: "1rem",
          borderRadius: "8px",
          border: "1px solid #ffeaa7"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ===================================================================== */}
      {/* HERO SECTION - Profile and Introduction */}
      {/* ===================================================================== */}
      <div className="hero-wrapper">
        <div className="hero">
          {/* Profile Image - FROM WALRUS! */}
          <div className="avatar">
            <img
              src={profileImageUrl}
              alt={portfolioData.name}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.log("Image failed, trying fallback...");
                // Try local fallback
                (e.target as HTMLImageElement).src = '/walrus-photo.png';
                // If that fails too, use default
                (e.target as HTMLImageElement).onerror = () => {
                  (e.target as HTMLImageElement).src = '/profile.png';
                };
              }}
              crossOrigin="anonymous"
              style={{
                border: imageLoaded ? "none" : "2px dashed #667eea",
                opacity: imageLoaded ? 1 : 0.8
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
          href={`https://suiscan.xyz/testnet/object/${objectId}`} 
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
          Project deployed in Sui
        </a>
        
        {/* Walrus Link (only show if we have a Walrus ID) */}
        {walrusImageId && (
          <a 
            href={`https://walruscan.com/testnet/blob/${walrusImageId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#10B981',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              fontSize: '0.8rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 16V20H8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 4H20V8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 20H20V16" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 8V4H8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 8L16 16" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16L16 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Image uploaded in Walrus
          </a>
        )}
      </div>
    </div>
  </div>
</div>
    </>
  )
}

export default PortfolioView