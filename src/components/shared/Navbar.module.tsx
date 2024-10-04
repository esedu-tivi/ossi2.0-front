import React from 'react';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.title}>Student Dashboard</h1>
    </nav>
  );
};

export default Navbar;

