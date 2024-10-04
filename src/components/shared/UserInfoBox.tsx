import React from 'react';
import styles from './UserInfoBox.module.css';

const UserInfoBox: React.FC = () => {
  
  const user = {
    name: 'Malli Oppilas',
    email: 'mallioppilas@esedulainen.fi',
    group: 'Ryhmä-XXXXXXX'
  };

  return (
    <div className={styles.userInfoBox}>
      <h2>Käyttäjä</h2>
      <p>
        <strong>Nimi:</strong> {user.name}
      </p>
      <p>
        <strong></strong> {user.email}
      </p>
      <p>
        <strong>Ryhmä:</strong> {user.group}
      </p>
    </div>
  );
};

export default UserInfoBox;

