import React, { useContext } from "react";
import { SiteContext } from "../../context/site";
import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';

const CookiePolicy = () => {
    const { getAContent } = useContext(SiteContext);
    
    return (
        <>
            <Header />
            <Title title={getAContent('cmp_vetonest.com_Cookie_Policy_Title', 'Cookie Policy')} />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
                <h1>{getAContent('cmp_vetonest.com_Cookie_Policy_Title', 'Cookie Policy')}</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                
                <h2>What are cookies?</h2>
                <p>Cookies are small text files stored on your device when you visit our website...</p>
                
                <h2>Types of cookies we use</h2>
                <ul>
                    <li><strong>Necessary cookies</strong> - Required for the website to function</li>
                    <li><strong>Functional cookies</strong> - Enhance your browsing experience</li>
                    <li><strong>Analytics cookies</strong> - Help us understand how visitors use our site</li>
                    <li><strong>Marketing cookies</strong> - Used for advertising purposes</li>
                </ul>
                
                <h2>How to manage cookies</h2>
                <p>You can manage your cookie preferences at any time by clicking the cookie icon at the bottom left of the page...</p>
            </div>
            <Footer />
        </>
    );
};

export default CookiePolicy;