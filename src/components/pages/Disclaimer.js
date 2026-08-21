import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import Title from "../Title";

const Disclaimer = () => {
  return (
    <>
      <style>
        {`
          .disclaimer-content p {
            margin-bottom: 1.2em;
          }
          .disclaimer-content p:first-of-type {
            margin-bottom: 1.5em;
          }
        `}
      </style>
      <div className="sticky-stack">
        <Header />
        <Title title="Disclaimer médical - VetoNest" />
      </div>
      <br />
      <div className="disclaimer-content" style={{ marginLeft: "70px", marginRight: "20px" }}>
        <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          Les informations fournies sur VetoNest, y compris celles générées par intelligence artificielle,
          sont fournies à titre informatif uniquement.
        </p>
        <p>
          Elles ne constituent en aucun cas un avis médical vétérinaire, un diagnostic ou une prescription.
        </p>
        <p>
          En cas de doute ou de problème de santé concernant votre animal, il est impératif de consulter
          un vétérinaire qualifié.
        </p>
        <p>
          L'utilisation des informations proposées sur ce site se fait sous l'entière responsabilité de l'utilisateur.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default Disclaimer;