import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ChipSelector from '../common/ChipSelector';
import Selector from '../Selector';
import { useFormHandleManager } from '../../hooks/useFormHandleManager';
import { useQuery } from '@apollo/client';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { GET_QUALIFICATION_UNITS } from '../../graphql/GetQualificationUnits';
import { GET_STUDENTS } from '../../graphql/GetStudents';

type Item = { id: string; name: string };
type Tag = Item;
type Group = Item;
type Part = Item;
type Student = { groupId?: string };

const TeacherProfileSettings: React.FC = () => {
	const initialState = {
		tags: [] as Tag[],
		groups: [] as Group[],
		includedInParts: [] as Part[],
		duration: 0,
		isActive: false,
		competenceRequirements: [] as Item[],
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

	const { data: tagData, refetch: refetchTags } = useQuery(GET_PROJECT_TAGS);
	const tagOptions: Tag[] = tagData?.projectTags?.projectTags || [];

	const { data: unitData } = useQuery(GET_QUALIFICATION_UNITS);
	const themeOptions: Part[] = unitData?.units?.units?.map((unit: any) => ({ id: unit.id, name: unit.name })) || [];

	const { data: studentsData } = useQuery(GET_STUDENTS);
	const students: Student[] = studentsData?.students?.students || [];
	const groupIds: string[] = Array.from(
		new Set(students.map((s) => s.groupId).filter((id): id is string => Boolean(id)))
	);
	const groupOptions: Group[] = groupIds.map((g) => ({ id: g, name: g }));

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
				return themeOptions;
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
