import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Handle navigation to dedicated login/signup pages
  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToSignup = () => {
    navigate('/register');
  };

  return (
    <>
      <style>{`
        /* ======================= Global Styles & Variables ======================= */
        :root {
            --primary-color: #4A7C7C; /* Dusty Teal */
            --secondary-color: #EADBC8; /* Warm Beige */
            --background-color: #F7F5F2; /* Creamy Off-white */
            --text-color: #4B5563; /* Medium Gray */
            --heading-color: #333333; /* Dark Gray */
            --card-bg: #FFFFFF;
            --border-color: #EAEAEA; 
            --font-family: 'Poppins', sans-serif;
        }

        .homepage-container {
            font-family: var(--font-family);
            color: var(--text-color);
            background-color: var(--background-color);
            line-height: 1.6;
        }

        .homepage-container * {
            box-sizing: border-box;
        }

        .homepage-container .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .homepage-container h1, 
        .homepage-container h2, 
        .homepage-container h3 {
            color: var(--heading-color);
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        
        .homepage-container a {
            color: var(--primary-color);
            text-decoration: none;
        }

        /* ======================= Buttons & Links ======================= */
        .homepage-container .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            font-family: var(--font-family);
        }

        .homepage-container .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }
        .homepage-container .btn-primary:hover {
            background-color: #3A6363;
            transform: translateY(-2px);
        }

        .homepage-container .btn-secondary {
            background-color: transparent;
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
        }
        .homepage-container .btn-secondary:hover {
            background-color: #F0F5F5;
        }

        .homepage-container .btn-large {
            padding: 15px 30px;
            font-size: 1.1rem;
        }

        /* ======================= Home Page: Header ======================= */
        .homepage-container .main-header {
            background-color: white;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .homepage-container .main-header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .homepage-container .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--heading-color);
            text-decoration: none;
        }
        .homepage-container .main-nav ul {
            list-style: none;
            display: flex;
            gap: 2rem;
            margin: 0;
            padding: 0;
        }
        .homepage-container .main-nav a {
            text-decoration: none;
            color: var(--text-color);
            font-weight: 600;
            position: relative;
            padding-bottom: 5px;
        }
        .homepage-container .main-nav a::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: 0;
            left: 0;
            background-color: var(--primary-color);
            transition: width 0.3s ease;
        }
        .homepage-container .main-nav a:hover::after {
            width: 100%;
        }

        .homepage-container .header-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        /* ======================= Home Page: Sections ======================= */
        .homepage-container .hero {
            text-align: center;
            padding: 6rem 1rem;
            background: #FDFBF8;
        }
        .homepage-container .hero h1 {
            font-size: clamp(2.5rem, 5vw, 3.5rem);
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .homepage-container .hero p {
            font-size: 1.2rem;
            max-width: 600px;
            margin: 0 auto 2rem;
            color: #555;
        }

        .homepage-container .features {
            padding: 5rem 1rem;
        }
        .homepage-container .features h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 4rem;
        }
        .homepage-container .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }
        
        .homepage-container .feature-card {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            height: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            color: white;
            cursor: pointer;
        }
        .homepage-container .feature-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s ease;
        }
        .homepage-container .feature-card:hover img {
            transform: scale(1.1);
        }
        .homepage-container .feature-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to top, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0.2) 50%, transparent 100%);
            transition: background 0.4s ease;
        }
        .homepage-container .feature-card-content {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 1.5rem;
            z-index: 2;
        }
        .homepage-container .feature-card h3 {
            color: white;
            margin: 0;
            font-size: 1.5rem;
        }
        .homepage-container .feature-card p {
            margin: 0.5rem 0 0 0;
            max-height: 0;
            opacity: 0;
            transition: max-height 0.4s ease, opacity 0.4s ease;
        }
        .homepage-container .feature-card:hover p {
            max-height: 100px; 
            opacity: 1;
        }
        
        .homepage-container .content-section-wrapper {
            padding: 5rem 1rem;
        }
        .homepage-container .content-section-wrapper:nth-of-type(odd) {
            background-color: #fff;
        }
        .homepage-container .content-section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
        }
        .homepage-container .content-text ul {
            list-style: none;
            padding-left: 0;
        }
        .homepage-container .content-text li {
            position: relative;
            padding-left: 25px;
            margin-bottom: 1rem;
        }
        .homepage-container .content-text li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: var(--primary-color);
            font-weight: bold;
        }
        .homepage-container .content-image img {
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        /* ======================= Footer ======================= */
        .homepage-container .main-footer {
            text-align: center;
            padding: 2rem 0;
            margin-top: 2rem;
            border-top: 1px solid var(--border-color);
            background: #fff;
        }

        @media (max-width: 768px) {
            .homepage-container .content-section-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            
            .homepage-container .main-nav {
                display: none;
            }
        }
      `}</style>

      <div className="homepage-container">
        <header className="main-header">
          <div className="container">
            <a href="#" className="logo">ThrivePath</a>
            <nav className="main-nav">
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#for-therapists">For Therapists</a></li>
                <li><a href="#for-parents">For Parents</a></li>
              </ul>
            </nav>
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={handleNavigateToLogin}>
                Login
              </button>
              <button className="btn btn-primary" onClick={handleNavigateToSignup}>
                Sign Up
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="container">
              <h1>Personalized Therapy Pathways for Autism Care</h1>
              <p>A collaborative, data-driven platform empowering therapists and parents to unlock every child's potential.</p>
              <button className="btn btn-primary btn-large">Request a Demo</button>
            </div>
          </section>

          <section id="features" className="features">
            <div className="container">
              <h2>A Platform Built for Growth</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <img src="https://source.unsplash.com/400x350/?calendar,planning" alt="Automated Scheduling" />
                  <div className="feature-card-content">
                    <h3>Automated Scheduling</h3>
                    <p>Real-time performance data automatically adjusts future sessions to match your child's pace.</p>
                  </div>
                </div>
                <div className="feature-card">
                  <img src="https://source.unsplash.com/400x350/?chart,graph" alt="Visual Learning Graph" />
                  <div className="feature-card-content">
                    <h3>Visual Learning Graph</h3>
                    <p>Visualize skill dependencies and map the clearest path to mastery for every therapeutic goal.</p>
                  </div>
                </div>
                <div className="feature-card">
                  <img src="https://source.unsplash.com/400x350/?teamwork,collaboration" alt="Seamless Collaboration" />
                  <div className="feature-card-content">
                    <h3>Seamless Collaboration</h3>
                    <p>A unified space for therapists and parents to track progress and manage homework.</p>
                  </div>
                </div>
                <div className="feature-card">
                  <img src="https://source.unsplash.com/400x350/?security,lock" alt="Offline & Secure" />
                  <div className="feature-card-content">
                    <h3>Offline & Secure</h3>
                    <p>Access all features online or off, with fully encrypted local data storage and secure sync.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section id="for-therapists" className="content-section-wrapper">
            <div className="container content-section-grid">
              <div className="content-text">
                <h2>Tools Designed for Therapists</h2>
                <p>Streamline your workflow and focus on what matters most—delivering effective therapy. Our platform gives you the power to plan, execute, and adapt with precision.</p>
                <ul>
                  <li>Use the drag-and-drop planner and activity library to build sessions in minutes.</li>
                  <li>Log performance with one-tap controls during sessions, capturing crucial data effortlessly.</li>
                  <li>Leverage our adaptive scheduler to automatically adjust future plans based on real-time results.</li>
                  <li>Generate comprehensive PDF and CSV reports for progress reviews and IEP meetings.</li>
                </ul>
              </div>
              <div className="content-image">
                <img src="https://source.unsplash.com/500x400/?therapist,office" alt="Therapist working on a laptop" />
              </div>
            </div>
          </section>
          
          <section id="for-parents" className="content-section-wrapper">
            <div className="container content-section-grid">
              <div className="content-image">
                <img src="https://source.unsplash.com/500x400/?parent,child,homework" alt="Parent and child looking at a tablet" />
              </div>
              <div className="content-text">
                <h2>Empowering Parents & Caregivers</h2>
                <p>Stay connected to your child's therapeutic journey. ThrivePath provides a clear window into their progress and gives you the tools to support their growth at home.</p>
                <ul>
                  <li>View easy-to-understand charts showing skill mastery and progress over time.</li>
                  <li>See upcoming sessions and the activities planned by the therapist.</li>
                  <li>Manage homework assignments, view resources, and mark tasks as complete.</li>
                  <li>Receive optional notifications and reminders to stay on track with at-home activities.</li>
                </ul>
              </div>
            </div>
          </section>
        </main>

        <footer className="main-footer">
          <div className="container">
            <p>&copy; 2025 ThrivePath. All Rights Reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
          </div>
        </footer>

      </div>
    </>
  );
};