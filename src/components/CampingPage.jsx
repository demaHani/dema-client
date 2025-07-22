import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const CampingPage = () => {
  return (
    <Container>
      <HeroSection>
        <HeroContent>
          <ComingSoonBadge>🚀 Coming Soon</ComingSoonBadge>
          <HeroTitle>Camping Adventures in Jordan</HeroTitle>
          <HeroSubtitle>
            Experience the thrill of outdoor camping in Jordan's most beautiful natural landscapes. 
            From desert camping under the stars to mountain retreats, we're building something amazing for you.
          </HeroSubtitle>
          <FeaturesList>
            <FeatureItem>
              <FeatureIcon>🏕️</FeatureIcon>
              <FeatureText>Desert Camping in Wadi Rum</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>⛰️</FeatureIcon>
              <FeatureText>Mountain Camping in Ajloun</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>🏖️</FeatureIcon>
              <FeatureText>Beach Camping in Aqaba</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>🌌</FeatureIcon>
              <FeatureText>Stargazing Experiences</FeatureText>
            </FeatureItem>
          </FeaturesList>
          <ActionButtons>
            <NotifyButton>
              <i className="fas fa-bell"></i>
              Get Notified When Available
            </NotifyButton>
            <BackButton to="/">
              <i className="fas fa-arrow-left"></i>
              Back to Hotels
            </BackButton>
          </ActionButtons>
        </HeroContent>
        <HeroImage>
          <CampingIllustration>🏕️</CampingIllustration>
        </HeroImage>
      </HeroSection>

      <InfoSection>
        <InfoCard>
          <InfoIcon>🎯</InfoIcon>
          <InfoTitle>What to Expect</InfoTitle>
          <InfoText>
            Our camping platform will offer guided camping experiences, equipment rentals, 
            and exclusive access to Jordan's most stunning natural locations.
          </InfoText>
        </InfoCard>
        <InfoCard>
          <InfoIcon>📅</InfoIcon>
          <InfoTitle>Launch Timeline</InfoTitle>
          <InfoText>
            We're working hard to bring you the best camping experience. 
            Expected launch: Q2 2024
          </InfoText>
        </InfoCard>
        <InfoCard>
          <InfoIcon>💡</InfoIcon>
          <InfoTitle>Features in Development</InfoTitle>
          <InfoText>
            • Equipment rental and delivery<br/>
            • Guided camping tours<br/>
            • Safety and emergency support<br/>
            • Mobile app for campers
          </InfoText>
        </InfoCard>
      </InfoSection>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 70px;
`;

const HeroSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  min-height: 70vh;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  max-width: 600px;
`;

const ComingSoonBadge = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FeatureIcon = styled.span`
  font-size: 1.5rem;
`;

const FeatureText = styled.span`
  color: white;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const NotifyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #10b981;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

  &:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  i {
    font-size: 0.9rem;
  }
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    color: white;
  }

  i {
    font-size: 0.9rem;
  }
`;

const HeroImage = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 400px;

  @media (max-width: 768px) {
    margin-top: 2rem;
  }
`;

const CampingIllustration = styled.div`
  font-size: 15rem;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @media (max-width: 768px) {
    font-size: 8rem;
  }
`;

const InfoSection = styled.div`
  background: white;
  padding: 4rem 2rem;
`;

const InfoCard = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const InfoText = styled.p`
  font-size: 1rem;
  color: #64748b;
  line-height: 1.6;
`;

export default CampingPage; 