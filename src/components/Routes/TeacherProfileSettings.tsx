import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ChipSelector from '../common/ChipSelector';
import Selector from '../Selector';
import { useFormHandleManager } from '../../hooks/useFormHandleManager';
import { useQuery } from '@apollo/client';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { GET_QUALIFICATION_UNIT_PARTS } from '../../graphql/GetQualificationUnitParts';
import { GET_STUDENTS } from '../../graphql/GetStudents';

const TeacherProfileSettings: React.FC = () => {
	const initialState = {
		tags: [],
		groups: [],
		includedInParts: [],
		duration: 0,
		isActive: false,
		competenceRequirements: [],
		description: '',
		materials: '',
	};

	const {
		formData,
		selectorOpen,
		setSelectorOpen,
		currentField,
		selectedItems,
		handleAdd,
		handleAddItem,
	} = useFormHandleManager(initialState);

	// Tags
	const { data: tagData, refetch: refetchTags } = useQuery(GET_PROJECT_TAGS);
	const tagOptions = tagData?.projectTags?.projectTags || [];

	// Qualification unit parts
	const { data: partData } = useQuery(GET_QUALIFICATION_UNIT_PARTS);
	const partOptions = partData?.parts?.parts || [];

	// Groups from students' groupIds
	const { data: studentsData } = useQuery(GET_STUDENTS);
	const groupIds: string[] = Array.from(
		new Set((studentsData?.students?.students || []).map((s: any) => s.groupId).filter(Boolean))
	);
	const groupOptions = groupIds.map((g) => ({ id: g, name: g }));

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Selected:', {
			tags: formData.tags,
			groups: formData.groups,
			includedInParts: formData.includedInParts,
		});
	};

	const getItems = () => {
		switch (currentField) {
			case 'tags':
				return tagOptions;
			case 'groups':
				return groupOptions;
			case 'includedInParts':
				return partOptions;
			default:
				return [];
		}
	};

	const getTitle = () => {
		switch (currentField) {
			case 'tags':
				return 'Valitse tagit';
			case 'groups':
				return 'Valitse ryhmät';
			case 'includedInParts':
				return 'Valitse tutkinnonosat';
			default:
				return '';
		}
	};

	return (
		<Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
			<Typography variant="h5" gutterBottom>
				Seuranta-asetukset
			</Typography>

			<form onSubmit={handleSubmit}>
				<ChipSelector
					label="Tagit"
					items={Array.isArray(formData.tags) ? formData.tags : []}
					onAdd={() => handleAddItem('tags')}
					currentField="tags"
				/>
				<ChipSelector
					label="Ryhmä(t)"
					items={Array.isArray(formData.groups) ? formData.groups : []}
					onAdd={() => handleAddItem('groups')}
					currentField="groups"
				/>
				<ChipSelector
					label="Tutkinnonosat"
					items={Array.isArray(formData.includedInParts) ? formData.includedInParts : []}
					onAdd={() => handleAddItem('includedInParts')}
					currentField="includedInParts"
				/>

				<Button type="submit" variant="contained" sx={{ mt: 3 }}>
					Tallenna muutokset
				</Button>
			</form>

			<Selector
				items={getItems()}
				title={getTitle()}
				buttonText="Lisää valitut"
				open={selectorOpen}
				selectedItems={selectedItems?.[currentField] || []}
				onAdd={handleAdd}
				onClose={() => setSelectorOpen(false)}
				currentField={currentField}
				updateProjectTags={refetchTags}
			/>
		</Box>
	);
};

export default TeacherProfileSettings;
