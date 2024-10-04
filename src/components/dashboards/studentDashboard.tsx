import React from 'react';
import Navbar from '../shared/Navbar.module';
import UserInfoBox from '../shared/UserInfoBox';
import styles from './StudentDashboard.module.css';

const StudentDashboard: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className={styles.dashboardContainer}>
        <UserInfoBox />
        <div className={styles.canvasArea}>
          {}
          <h2>OppilasNäkymä</h2>
          {}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

