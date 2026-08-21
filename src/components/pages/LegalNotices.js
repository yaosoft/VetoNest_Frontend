import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import Title from "../Title";

const LegalNotices = () => {
  return (
    <>
      <style>
        {`
          .legal-content p {
            margin-bottom: 1.2em;
          }
          .legal-content h2 {
            margin-top: 1.5em;
            margin-bottom: 0.8em;
          }
          .legal-content h3 {
            margin-top: 1.2em;
            margin-bottom: 0.6em;
          }
        `}
      </style>
      <div className="sticky-stack">
        <Header />
        <Title title="Mentions légales - VetoNest" />
      </div>
      <br />
      <div className="legal-content" style={{ marginLeft: "70px", marginRight: "20px" }}>
        <h2>Éditeur du site</h2>
        <p>
          Le site VetoNest est édité par :<br />
          DELPHY PRODUCTION<br />
          Forme juridique : SASU<br />
          Capital social : 45 K€<br />
          Siège social : 229 Rue St Honoré - 75001 Paris
        </p>

        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par :<br />
          Nom de l'hébergeur : [À compléter]<br />
          Adresse : [Adresse hébergeur]<br />
          Site web : [URL]
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des éléments présents sur le site (textes, images, logo, code, etc.) est protégé
          par le droit de la propriété intellectuelle. Toute reproduction, distribution ou utilisation
          sans autorisation préalable est interdite.
        </p>

        <h2>Responsabilité</h2>
        <p>
          L'éditeur du site ne saurait être tenu responsable des erreurs ou omissions dans les
          informations diffusées, ni de l'utilisation qui pourrait en être faite par les utilisateurs.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question : <a href="mailto:info@vetonest.com">info@vetonest.com</a>
        </p>
      </div>
      <Footer />
    </>
  );
};

export default LegalNotices;