import React from 'react';
import Selector from '../Selector';

const items = [
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
    'Item 5',
    'Item 6',
    'Item 7',
    'Item 8',
    'Item 9',
    'Item 10',
    'Item 11',
    'Item 12',
    'Item 13',
    'Item 14',
    'Item 15',
    'Item 16',
    'Item 17',
    'Item 18',
    'Item 19',
    'Item 20',
];

const StudentDashboard: React.FC = () => {
    const handleAdd = (selectedItems: string[]) => {
        console.log('Selected items:', selectedItems);
    };

    return (
        <div>
            <h2>OppilasNäkymä</h2>
            <Selector items={items} title="Valitse Teemat" buttonText="Lisää Teemat" openWindow={true} onAdd={handleAdd} />
        </div>
    );
};

export default StudentDashboard;
