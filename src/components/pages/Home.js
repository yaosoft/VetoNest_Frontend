import React, { useContext } from "react";
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

  const countries = [
    { code: "fr", name: getAContent("cmp_vetonest.com_Fr23An45Ce") },
    { code: "be", name: getAContent("cmp_vetonest.com_Be99Lg12Iq") },
    { code: "it", name: getAContent("cmp_vetonest.com_It77Al44Ie") },
    { code: "es", name: getAContent("cmp_vetonest.com_Es11Pa55Ne") },
    { code: "de", name: getAContent("cmp_vetonest.com_De66Al33Ma") },
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
            style={{ backgroundImage: "url('/img/home/hero-bg-blur.jpg')" }}
          />
          <div className="hero-overlay" />

          <div className="container hero-grid">
            <div className="hero-text">
              <div className="heroTitle">
                {getAContent("cmp_vetonest.com_Sv24Ve07Rh")}
              </div>

              <p className="hero-sub">
                {getAContent("cmp_vetonest.com_Cv88Li99Ne")}
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
                  {/*
				  <Link to="/recherche" className="btn backgroundBlack text-white">
					{getAContent("cmp_vetonest.com_Tv66Ve88Ri")}
				  </Link>
				  */}
              </div>
            </div>

            <div className="hero-image">
              <img
                src="/img/home/hero.jpg"
                alt={getAContent("cmp_vetonest.com_Cv00Ch44In")}
              />
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="home-search text-center">
          <div className="container">
            <p className="section-lead searchTitle">
              {getAContent("cmp_vetonest.com_Tr11Ve22Id")}
            </p>

            <p className="section-sub">
              {getAContent("cmp_vetonest.com_Pv33Ve55Ve")}
            </p>
			<p>&nbsp;</p>
            <div className="flags-row">
              {countries.map((c) => (
                <div key={c.code} className="flag-item">
                  <img
                    src={`/img/flags/${c.code}.svg`}
                    alt={c.name}
                  />
                  <span>{c.name}</span>
                </div>
              ))}
            </div>

            <div className="coming-soon">
              {getAContent("cmp_vetonest.com_Eb44Pa11Ys")}
            </div>
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
            </div>

            <div className="image-card">
              <img
                src="/img/home/smart-matching.jpg"
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
                    src="/img/home/online.jpg"
                    alt={getAContent("cmp_vetonest.com_Ce33Li11Ne")}
                  />
                </div>
                <h3>{getAContent("cmp_vetonest.com_Ce33Li11Ne")}</h3>
                <p>{getAContent("cmp_vetonest.com_Vc44Ch77Ut")}</p>
              </div>

              <div className="card service-card">
                <div className="image-wrapper">
                  <img
                    src="/img/home/clinic.jpg"
                    alt={getAContent("cmp_vetonest.com_Ce55Cl22In")}
                  />
                </div>
                <h3>{getAContent("cmp_vetonest.com_Ce55Cl22In")}</h3>
                <p>{getAContent("cmp_vetonest.com_Rv66Pr44Zz")}</p>
              </div>

              <div className="card service-card">
                <div className="image-wrapper">
                  <img
                    src="/img/home/home.jpg"
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
        <section className="ai-section">
          <div className="container grid-2">
            <div>
              <div className="customSectionTitle">
                {getAContent("cmp_vetonest.com_Cs99Sy11As")}
              </div>
				<p>&nbsp;</p>
              { /* <p>
                {getAContent("cmp_vetonest.com_Rs33Sy44In")}
              </p>
			  <p>&nbsp;</p>
			  */ }
              <p>
                {getAContent("cmp_vetonest.com_Fv55Ve66Cl")}
              </p>
			  <p>&nbsp;</p>
			  <p>
			    {getAContent("cmp_vetonest.com_Pl88Za22Xm")}
			  </p>
            </div>

            <div className="image-card">
              <img
                src="/img/home/ai-chat.jpg"
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
                src="/img/home/vets-trust.jpg"
                alt={getAContent("cmp_vetonest.com_Ev33Pr44Tr")}
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* APP */}
        <section className="app">
          <div className="container grid-2">
            <div>
              <h2>{getAContent("cmp_vetonest.com_Vn55Po66Ke")}</h2>
              <p>{getAContent("cmp_vetonest.com_Cv77Ve88Pa")}</p>

              <div className="app-links">
                <img
                  src="/img/Store/appStore.jpg"
                  alt={getAContent("cmp_vetonest.com_As11St22Re")}
                />
                <img
                  src="/img/Store/playStore.jpg"
                  alt={getAContent("cmp_vetonest.com_Gp33Pl44Ay")}
                />
              </div>
            </div>

            <div className="image-card">
              <img
                src="/img/home/app.jpg"
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