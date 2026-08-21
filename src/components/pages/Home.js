import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { SiteContext } from "../../context/site";
import Header from "../Header";
import Footer from "../Footer";
import Title from "../Title";

export default function HomePage() {
  const {
    homeTitle,
    getAContent
  } = useContext(SiteContext);

  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const countries = [
    { code: "fr", name: getAContent("cmp_vetonest.com_Fr23An45Ce") },
    { code: "be", name: getAContent("cmp_vetonest.com_Be99Lg12Iq") },
    { code: "it", name: getAContent("cmp_vetonest.com_It77Al44Ie") },
    { code: "es", name: getAContent("cmp_vetonest.com_Es11Pa55Ne") },
    { code: "de", name: getAContent("cmp_vetonest.com_De66Al33Ma") },
  ];

  // FAQ Data
  const faqs = [
    {
      question: getAContent("cmp_vetonest.com_Faq1_Question", "Comment fonctionne VetOnest ?"),
      answer: getAContent("cmp_vetonest.com_Faq1_Answer", "VetOnest met en relation les propriétaires d'animaux avec des vétérinaires qualifiés. Vous pouvez rechercher un vétérinaire, consulter son profil, vérifier ses disponibilités et prendre rendez-vous en ligne, que ce soit en clinique, à domicile ou en téléconsultation.")
    },
    {
      question: getAContent("cmp_vetonest.com_Faq2_Question", "Les vétérinaires sont-ils vérifiés ?"),
      answer: getAContent("cmp_vetonest.com_Faq2_Answer", "Oui, tous les vétérinaires inscrits sur VetOnest sont soumis à un processus de vérification. Nous vérifions leurs diplômes et identifiants professionnels pour garantir des soins de qualité à votre animal.")
    },
    {
      question: getAContent("cmp_vetonest.com_Faq3_Question", "Puis-je consulter un vétérinaire à distance ?"),
      answer: getAContent("cmp_vetonest.com_Faq3_Answer", "Absolument ! De nombreux vétérinaires proposent des téléconsultations vidéo. C'est idéal pour les conseils, les suivis ou les situations non urgentes, sans vous déplacer.")
    },
    {
      question: getAContent("cmp_vetonest.com_Faq5_Question", "Puis-je annuler ou modifier un rendez-vous ?"),
      answer: getAContent("cmp_vetonest.com_Faq5_Answer", "Oui, vous pouvez annuler ou modifier votre rendez-vous directement depuis votre espace client. Veuillez respecter le délai d'annulation indiqué par le vétérinaire (généralement 24h à l'avance).")
    },
    {
      question: getAContent("cmp_vetonest.com_Faq6_Question", "Les vétérinaires se déplacent-ils à domicile ?"),
      answer: getAContent("cmp_vetonest.com_Faq6_Answer", "Certains vétérinaires proposent des consultations à domicile. Vous pouvez filtrer votre recherche par ce critère et choisir un vétérinaire qui se déplace chez vous.")
    }
  ];

  return (
    <>
      <div className="sticky-stack">
        <Header />
        <Title title={getAContent( 'cmp_vetonest.com_y50xzTXzES' )} />
      </div>

      <main className="home">

        {/* HERO */}
        <section className="hero">
          <div
            className="hero-bg"
            style={{ backgroundImage: "url('/img/Home/hero-bg-blur.jpg')" }}
          />
          <div className="hero-overlay" />

          <div className="container hero-grid">
            <div className="hero-text">
              <div className="heroTitle">
                {getAContent("cmp_vetonest.com_zDVB9q7a2d")}
              </div>

              <p className="hero-sub">
                {getAContent("cmp_vetonest.com_Booking247_Txt")}
              </p>

              <div className="hero-steps steps">
                <div className="step">
                  <span className="step-badge">1</span>
                  <span>{getAContent("cmp_vetonest.com_Cc44Ac22Ou")}</span>
                </div>
                <div className="step">
                  <span className="step-badge">2</span>
                  <span>{getAContent("cmp_vetonest.com_Av11An33Im")}</span>
                </div>
                <div className="step">
                  <span className="step-badge">3</span>
                  <span>{getAContent("cmp_vetonest.com_Cv55Ve11Te")}</span>
                </div>
              </div>

              <div className="hero-cta">
                <Link to="/inscription" className="btn backgroundYellow">
                  {getAContent("cmp_vetonest.com_Cm22Er00Te")}
                </Link>
              </div>
            </div>

            <div className="hero-image">
              <img
                src="/img/Home/hero.jpg"
                alt={getAContent("cmp_vetonest.com_Cv00Ch44In")}
              />
            </div>
          </div>
        </section>

		{/* BETA TESTING ANNOUNCEMENT - NAMUR */}
		<section className="home-search text-center">
		  <div className="container">
			<div className="beta-announcement">
			  <span className="beta-badge">
				{getAContent("cmp_vetonest.com_BetaBadge")}
			  </span>
			  
			  <div className="namur-highlight">
				<img 
				  src="/img/flags/be.svg" 
				  alt={getAContent("cmp_vetonest.com_BelgiumFlagAlt")}
				  className="namur-flag"
				/>
				<h2 className="namur-title">
				  {getAContent("cmp_vetonest.com_NamurTitle")}
				</h2>
			  </div>
			  
			  <p className="beta-message">
				{getAContent("cmp_vetonest.com_BetaMessage")}
			  </p>
			  
			  <div className="beta-features">
				<div className="beta-feature">
				  <span className="feature-icon">✅</span>
				  <span>{getAContent("cmp_vetonest.com_BetaFeature1")}</span>
				</div>
				<div className="beta-feature">
				  <span className="feature-icon">📱</span>
				  <span>{getAContent("cmp_vetonest.com_BetaFeature2")}</span>
				</div>
				<div className="beta-feature">
				  <span className="feature-icon">🚀</span>
				  <span>{getAContent("cmp_vetonest.com_BetaFeature3")}</span>
				</div>
			  </div>

			  <div className="vet-cta">
				<Link to="/inscription" className="btn backgroundYellow">
				  {getAContent("cmp_vetonest.com_VetCtaButton")}
				</Link>
			  </div>
			  
			  <p className="beta-note">
				<small>{getAContent("cmp_vetonest.com_BetaNote")}</small>
			  </p>
			</div>

			<style jsx>{`
			  .beta-announcement {
				background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
				border-radius: 32px;
				padding: 3rem 2rem;
				box-shadow: 0 10px 30px rgba(0,0,0,0.05);
			  }
			  .beta-badge {
				display: inline-block;
				background: #ff6b35;
				color: white;
				padding: 0.25rem 1rem;
				border-radius: 50px;
				font-size: 0.85rem;
				font-weight: 600;
				margin-bottom: 1.5rem;
				letter-spacing: 1px;
			  }
			  .namur-highlight {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 1rem;
				margin-bottom: 1.5rem;
			  }
			  .namur-flag {
				width: 35px;
				height: 35px;
				border-radius: 8px;
				box-shadow: 0 2px 8px rgba(0,0,0,0.1);
			  }
			  .namur-title {
				font-size: 2rem;
				font-weight: 700;
				color: #1a3c34;
				margin: 0;
			  }
			  .beta-message {
				font-size: 1rem;
				color: #2c3e50;
				max-width: 600px;
				margin: 1rem auto;
				line-height: 1.6;
			  }
			  .beta-message strong {
				color: #ff6b35;
			  }
			  .beta-features {
				display: flex;
				justify-content: center;
				gap: 2rem;
				flex-wrap: wrap;
				margin: 2rem 0;
			  }
			  .beta-feature {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				background: white;
				padding: 0.5rem 1rem;
				border-radius: 50px;
				box-shadow: 0 2px 8px rgba(0,0,0,0.05);
				font-size: 0.95rem;
			  }
			  .feature-icon {
				font-size: 1.2rem;
			  }
			  .vet-cta {
				text-align: center;
				margin: 0.5rem 0;
			  }
			  .vet-btn {
				background: #1a3c34;
				color: white;
				padding: 0.9rem 2rem;
				border-radius: 50px;
				font-weight: 600;
				transition: all 0.3s ease;
				display: inline-block;
				text-decoration: none;
			  }
			  .vet-btn:hover {
				background: #ff6b35;
				transform: translateY(-2px);
			  }
			  .beta-note {
				margin-top: 1.0rem;
				color: #7f8c8d;
				text-align: center;
			  }
			`}</style>
		  </div>
		</section>
        {/* WHY */}
        <section className="why">
          <div className="container grid-2 align-top">
            <div className="why-text">
              <div className="customSectionTitle">
                {getAContent("cmp_vetonest.com_Sm22Ma66Tc")}
              </div>
              <p>&nbsp;</p>
              <p>
                {getAContent("cmp_vetonest.com_Vn92Qw77Rt")}
              </p>
              <p>
                <br/>
              </p>
              <p>
                {getAContent("cmp_vetonest.com_Gt88Al44Go")}
              </p>
              <p>
                <br/>
              </p>
              <div className="hero-cta">
                <Link to="/vet-listing" className="btn btn-success">
                  {getAContent("cmp_vetonest.com_GetAppt_Bt")}
                </Link>
              </div>
            </div>
            
            <div className="image-card">
              <img
                src="/img/Home/smart-matching.jpg"
                alt={getAContent("cmp_vetonest.com_Ti55Pr44Im")}
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="services">
          <div className="container">
            <div className="customSectionTitle">
              {getAContent("cmp_vetonest.com_Dc22Co99Ad")}
            </div>
            <p>&nbsp;</p>
            <div className="grid-3">
              <div className="card service-card">
                <div className="image-wrapper">
                  <img
                    src="/img/Home/online.jpg"
                    alt={getAContent("cmp_vetonest.com_Ce33Li11Ne")}
                  />
                </div>
                <h3>{getAContent("cmp_vetonest.com_Ce33Li11Ne")}</h3>
                <p>{getAContent("cmp_vetonest.com_Vc44Ch77Ut")}</p>
              </div>

              <div className="card service-card">
                <div className="image-wrapper">
                  <img
                    src="/img/Home/clinic.jpg"
                    alt={getAContent("cmp_vetonest.com_Ce55Cl22In")}
                  />
                </div>
                <h3>{getAContent("cmp_vetonest.com_Ce55Cl22In")}</h3>
                <p>{getAContent("cmp_vetonest.com_Rv66Pr44Zz")}</p>
              </div>

              <div className="card service-card">
                <div className="image-wrapper">
                  <img
                    src="/img/Home/home.jpg"
                    alt={getAContent("cmp_vetonest.com_Cd77Do11Mi")}
                  />
                </div>
                <h3>{getAContent("cmp_vetonest.com_Cd77Do11Mi")}</h3>
                <p>{getAContent("cmp_vetonest.com_Uv88Ch22Ez")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI */}
        <section className="why">
          <div className="container grid-2 align-top">
            <div className="why-text">
              <div className="customSectionTitle">
                {getAContent("cmp_vetonest.com_Cs99Sy11As")}
              </div>
              <p>&nbsp;</p>
              <p>
                {getAContent("cmp_vetonest.com_Fv55Ve66Cl")}
              </p>
              <p>
                <br/>
              </p>
              <p>
                {getAContent("cmp_vetonest.com_Pl88Za22Xm")}
              </p>
              <p>
                <br/>
              </p>
              <div className="hero-cta">
                <Link to="/vet-listing" className="btn btn-success">
                  {getAContent("cmp_vetonest.com_TalkToVet_Bt")}
                </Link>
              </div>
            </div>

            <div className="image-card">
              <img
                src="/img/Home/ai-chat.jpg"
                alt={getAContent("cmp_vetonest.com_Av77Ia88Ch")}
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="trust">
          <div className="container grid-2">
            <div>
              <div className="customSectionTitle">
                {getAContent("cmp_vetonest.com_Dv99Ve11Tr")}
              </div>
              <p className="lead">
                {getAContent("cmp_vetonest.com_Pa11Am22An")} ❤️
              </p>
                <p>&nbsp;</p>
              <ul className="checklist">
                <li>{getAContent("cmp_vetonest.com_Av55Vi66Qu")}</li>
                <li>{getAContent("cmp_vetonest.com_Dm77Se88Cu")}</li>
                <li>{getAContent("cmp_vetonest.com_Vd99Me11St")}</li>
                <li>{getAContent("cmp_vetonest.com_Rr11Rd22Vz")}</li>
                <li>{getAContent("cmp_vetonest.com_Vv33Ve44Ex")}</li>
                <li>{getAContent("cmp_vetonest.com_ClReg33Bt")}</li>
                <li>{getAContent("cmp_vetonest.com_VtInv44Bt")}</li>
              </ul>
            </div>

            <div className="image-card">
              <img
                src="/img/Home/vets-trust.jpg"
                alt={getAContent("cmp_vetonest.com_Ev33Pr44Tr")}
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="faq-section">
          <div className="container">
            <div className="customSectionTitle text-center">
              {getAContent("cmp_vetonest.com_Faq_Title", "Questions fréquentes")}
            </div>
            <p className="section-sub text-center">
              {getAContent("cmp_vetonest.com_Faq_Subtitle", "Tout ce que vous devez savoir sur VetOnest")}
            </p>
            
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <div 
                    className={`faq-question ${openFaq === index ? 'active' : ''}`}
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
                    <h3>{faq.question}</h3>
                  </div>
                  <div className={`faq-answer ${openFaq === index ? 'open' : ''}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* APP */}
		<section className="app">
		  <div className="container grid-2">
			<div>
			
			
			
			<div className="customSectionTitle text-center">
              {getAContent("cmp_vetonest.com_Vn55Po66Ke")}
            </div>
            <p className="section-sub text-center">
              {getAContent("cmp_vetonest.com_Cv77Ve88Pa")}
            </p>

			  <div className="app-responsive" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
				<div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
				<img
					src="/img/Home/iconLapPhone.jpg"
					alt={getAContent("cmp_vetonest.com_Am55Mo11Vn")}
					style={{ width: '150px' }}
					loading="lazy"
				  />
				</div> 
				<p style={{ fontSize: '0.95rem', color: '#2c3e50', lineHeight: '1.5', margin: 0 }}>
				  {getAContent("cmp_vetonest.com_AppResponsiveTextVet")}
				</p>
			  </div>
			  <p></p>
			  <div className="marginTop20">
                <Link to="/vet-listing" className="btn btn-success">
                  {getAContent("cmp_vetonest.com_GetAppt_Bt")}
                </Link>
              </div>
			</div>

			<div className="image-card">
			  <img
				src="/img/Home/app.jpg"
				alt={getAContent("cmp_vetonest.com_Am55Mo11Vn")}
				loading="lazy"
			  />
			</div>
		  </div>
		</section>

        {/* CTA */}
        <section className="cta">
          <div className="container">
            <h2>
              {getAContent("cmp_vetonest.com_Om77Me11An")}
            </h2>
            <Link to="/inscription" className="btn primary large">
              {getAContent("cmp_vetonest.com_Cm99Co11Fr")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}