import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ChipSelector from '../common/ChipSelector';
import Selector from '../Selector';
import { useFormHandleManager } from '../../hooks/useFormHandleManager';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { GET_QUALIFICATION_UNITS } from '../../graphql/GetQualificationUnits';
import { GET_STUDENTS } from '../../graphql/GetStudents';
import { USER_SETUP } from '../../graphql/UserSetup';
import { GET_TEACHER_PROFILE } from '../../graphql/GetTeacherProfile';
import { filterByKey } from '../../utils/filterByKey';
import { UPDATE_TEACHER_PROFILE } from '../../graphql/UpdateTeacherProfile';
import { useAlerts } from '../../context/AlertContext';

type Item = { id: string; name: string };
type Tag = Item;
type Group = Item;
type Part = Item;
type Student = { groupId?: string };

interface TagData extends Tag {
	__typename: string
}
interface StudentGroupData {
	groupId: string
}

interface PartData extends Part {
	__typename: string
}

const TeacherProfileSettings: React.FC = () => {
	const { addAlert } = useAlerts()
	const { data: userData } = useQuery(USER_SETUP)

	const userId = userData?.me.user.id
	const { data: assignedTeacherProfileData } = useQuery(GET_TEACHER_PROFILE, {
		variables: { teacherId: userId },
		skip: !userId
	})

	const assignedTags = assignedTeacherProfileData?.assignedTags.tags.map((tag: TagData) => ({
		id: tag.id,
		name: tag.name
	}))

	const assignedGroups = assignedTeacherProfileData?.assignedStudentGroups.studentGroups.map((group: StudentGroupData) => ({
		id: group.groupId,
		name: group.groupId
	}))

	const initialState = {
		tags: assignedTags as Tag[],
		groups: assignedGroups as Group[],
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
	const tagOptions: Tag[] = tagData?.projectTags?.projectTags.map((tag: TagData) => ({ id: tag.id, name: tag.name })) || [];

	const { data: unitData } = useQuery(GET_QUALIFICATION_UNITS);
	const themeOptions: Part[] = unitData?.units?.units?.map((unit: PartData) => ({ id: unit.id, name: unit.name })) || [];

	const { data: studentsData } = useQuery(GET_STUDENTS);
	const students: Student[] = studentsData?.students?.students || [];
	const groupIds: string[] = Array.from(
		new Set(students.map((s) => s.groupId).filter((id): id is string => Boolean(id)))
	);
	const groupOptions: Group[] = groupIds.map((g) => ({ id: g, name: g }));

	const [updateProfileSettings, { error: updateProfileSettingsError }] = useMutation(UPDATE_TEACHER_PROFILE, { refetchQueries: [GET_TEACHER_PROFILE] })

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Selected:', {
			tags: formData.tags,
			groups: formData.groups,
			includedInParts: formData.includedInParts,
		});

		const { added: addedTags, removed: removedTags } = filterByKey(initialState.tags, formData.tags, "id")
		const { added: addedGroups, removed: removedGroups } = filterByKey(
			initialState.groups,
			Array.isArray(formData.groups) ? formData.groups : [],
			"id"
		)

		if (addedTags.length || removedTags.length || addedGroups.length || removedGroups.length) {
			const response = await updateProfileSettings({
				variables: {
					userId: userId,
					assignedTagIds: addedTags.map(tag => tag.id),
					unassignedTagIds: removedTags.map(tag => tag.id),
					assignGroupIds: addedGroups.map(group => group.id),
					unassignGroupIds: removedGroups.map(group => group.id)
				}
			})

			if (!(response.data.updateTagAssigns.success || response.data.updateStudentGroupAssigns.success) || updateProfileSettingsError) {
				if (updateProfileSettingsError) {
					console.error('GraphQl error', updateProfileSettingsError)
				}
				if (!(response.data.updateTagAssigns.success || response.data.updateStudentGroupAssigns.success)) {
					console.error(response.data.updateTagAssigns, response.data.updateStudentGroupAssigns)
				}

				return addAlert("Jotain meni pieleen", "error", true)
			}
			return addAlert("Seuranta asetukset päivitetty onnistuneesti")
		}
		addAlert("Mitään päivitettävää ei ole valittu", "info")
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
