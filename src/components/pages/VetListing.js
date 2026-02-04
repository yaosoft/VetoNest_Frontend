import React, { useState, useEffect, useContext } from 'react';
import { Input, Row, Col, Card, Button, Rate, Skeleton } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import { SiteContext } from "../../context/site";
import { AuthContext } from "../../context/AuthProvider";
import Title from '../Title';
import Header from '../Header';
import Footer from '../Footer';

const { Meta } = Card;
const ListingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vetList, setVetList] = useState([]);
  const [loading, setLoading] = useState(true);

  const { 
    getAContent,
    getAVetoProfile,
    getTimeslot,
    getHollydays,
    getAbsences,
    truncateString,
    getAVetoLieux,
    siteLocale,
    base_url,
    allSpecialities,
    vetos
  } = useContext(SiteContext);

  const [photoDefaultSrc, setPhotoDefaultSrc] = useState('/img/user/1.jpg');

  // Simulate fetching vet data
  useEffect(() => {
    setLoading(true);
    console.log('>>>>>>> vetos', vetos);
    if (vetos.length)
      setVetList(vetos);
    setLoading(false);
  }, [vetos]);

  const filteredVets = vetList.filter((vet) =>
    vet.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGetAppointment = (vetId) => {
    // Navigate to appointment page (or show modal)
    alert(`Redirecting to appointment for vet ID: ${vetId}`);
  };

  return (
    <>
      <div className="sticky-stack">
        <Header />
        <Title title={getAContent('cmp_vetonest.com_ProfileOf_Txt')} />
      </div>

      <div className="listing-page">
        {/* Search and Filter */}
        <div className="search-bar">
          <Input
            placeholder="Search for a vet..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
        </div>

        {/* Vet List */}
        <Row gutter={16} className="vet-list">
          {loading ? (
            <Col span={8}>
              <Skeleton active />
            </Col>
          ) : (
            filteredVets.map((vet) => (
              <Col
                xs={24}  // 1 card per row on small screens
                sm={12}  // 2 cards per row on medium screens
                md={8}   // 3 cards per row on large screens
                key={vet.id}
              >
                <Card
                  hoverable
                  cover={
                    <img
                      src={
                        vet.picture
                          ? base_url + 'uploads/files/profile/' + vet.picture
                          : photoDefaultSrc
                      }
                      alt="Vet Profile"
                    />
                  }
                  className="vet-card"
                >
                  <Meta
                    title={vet.nom}
                    description={
                      <>
                        <p>
                          {allSpecialities.length && vet.vetoSpecialite
                            ? getAContent(
                                allSpecialities.filter(
                                  (e) => e.id === vet.vetoSpecialite.id
                                )[0].tagRef
                              )
                            : getAContent('cmp_vetonest.com_nDHuiDhEz3')}
                        </p>
                        <Rate disabled value={vet.rating} />
                        <p>Available today</p>
                      </>
                    }
                  />
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    size="large"
                    block
                    onClick={() => handleGetAppointment(vet.id)}
                  >
                    Get an Appointment
                  </Button>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </div>
    </>
  );
};

export default ListingPage;
