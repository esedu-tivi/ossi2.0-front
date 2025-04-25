import React, { useState } from 'react';
import Selector from '../Selector';
import { Item } from '../Selector'; // Oletetaan, että Item-tyyppi on määritelty tässä tiedostossa

const items: Item[] = [
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
].map((name, index) => ({
    id: `item-${index + 1}`,
    name: `Item ${name + 1}`,
    description: `Item Value ${name + 1}`
}));

const StudentDashboard: React.FC = () => {
    // Lisätään tilanhallinta dialogin avaamista/sulkemista varten
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);

    // Korjattu handleAdd-funktion tyyppi vastaamaan Selector-komponentin tyyppiä
    const handleAdd = (selected: Item[]) => {
        console.log('Selected items:', selected);
        setSelectedItems(selected);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    // Lisää puuttuvat updateProjectTags-funktion
    const updateProjectTags = (newTag: Item) => {
        console.log('New tag added:', newTag);
        // Implementoi tag-päivityslogiikka tarvittaessa
    };

    return (
        <div>
            <h2>OppilasNäkymä</h2>
            <Selector 
                items={items}
                title="Valitse Teemat"
                buttonText="Lisää Teemat"
                open={isOpen}
                onAdd={handleAdd}
                onClose={handleClose}
                selectedItems={selectedItems}
                updateProjectTags={updateProjectTags} currentField={''}            />
        </div>
    );
};

export default StudentDashboard;
