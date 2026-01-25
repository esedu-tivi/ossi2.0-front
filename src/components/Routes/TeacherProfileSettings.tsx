import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Autocomplete, TextField } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { GET_QUALIFICATION_UNITS } from '../../graphql/GetQualificationUnits';
import { GET_STUDENTS } from '../../graphql/GetStudents';
import { USER_SETUP } from '../../graphql/UserSetup';
import { GET_TEACHER_PROFILE } from '../../graphql/GetTeacherProfile';
import { filterByKey } from '../../utils/filterByKey';
import { UPDATE_TEACHER_PROFILE } from '../../graphql/UpdateTeacherProfile';
import { useAlerts } from '../../context/AlertContext';
import { CREATE_PROJECT_TAGS } from '../../graphql/CreateProjectTags';

type Item = { id: string; name: string, __isNew: boolean };
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

const normalizeValues = <T extends Item>(values: Array<T | string>): T[] => {
	return values.map(value => {
		if (typeof value === "string") {
			return {
				id: value,
				name: value,
				__isNew: true,
			} as T;
		}

		if (value.__isNew) {
			return {
				...value,
				name: value.name,
			};
		}

		return value;
	});
};

const TeacherProfileSettings: React.FC = () => {
	const { addAlert } = useAlerts()
	const { data: userData } = useQuery(USER_SETUP)

	const userId = userData?.me.user.id
	const { data: profileData, loading: profileLoading } = useQuery(GET_TEACHER_PROFILE, {
		variables: { teacherId: userId },
		skip: !userId
	})

	const initialState = {
		tags: [] as Tag[],
		groups: [] as Group[],
		includedInParts: [] as Part[],
	};

	const [formData, setFormData] = useState(initialState)

	const { data: tagData, refetch: refetchTags } = useQuery(GET_PROJECT_TAGS);
	const tagOptions: Tag[] = tagData?.projectTags?.projectTags.map((tag: TagData) => ({ id: tag.id, name: tag.name })) || [];

	const { data: unitData } = useQuery(GET_QUALIFICATION_UNITS);
	const themeOptions: Part[] = unitData?.units?.units?.map((unit: PartData) => ({ id: unit.id, name: unit.name })) || [];

	const { data: studentsData } = useQuery(GET_STUDENTS);
	const students: Student[] = studentsData?.students?.students || [];
	const groupIds: string[] = Array.from(
		new Set(students.map((s) => s.groupId).filter((id): id is string => Boolean(id)))
	);
	const groupOptions: Group[] = groupIds.map((g) => ({ id: g, name: g, __isNew: false, __inInit: true }));

	const [updateProfileSettings, { error: updateProfileSettingsError }] = useMutation(UPDATE_TEACHER_PROFILE, { refetchQueries: [GET_TEACHER_PROFILE] })
	const [createProjectTags] = useMutation(CREATE_PROJECT_TAGS)

	const assignedTags = profileData?.assignedTags?.tags?.map((tag: TagData) => ({
		id: tag.id,
		name: tag.name,
		__isNew: false,
	}))

	const assignedGroups = profileData?.assignedStudentGroups?.studentGroups?.map((group: StudentGroupData) => ({
		id: group.groupId,
		name: group.groupId
	}))

	const resolveTagIds = async (addedTags: Tag[]): Promise<string[]> => {
		const existingTagIds = addedTags.filter(tag => !tag.__isNew).map(tag => tag.id)
		const newTags = addedTags.filter(tag => tag.__isNew).map(tag => tag.name)

		if (!newTags.length) return existingTagIds.length ? existingTagIds : [];

		const response = await createProjectTags({
			variables: { names: newTags },
		});

		const createdIds = response.data.createProjectTags.projectTags.map((tag: Tag) => tag.id);
		return [...new Set([...existingTagIds, ...createdIds])];
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Selected:', {
			tags: formData.tags,
			groups: formData.groups,
			includedInParts: formData.includedInParts,
		});

		const { added: addedTags, removed: removedTags } = filterByKey(
			assignedTags,
			formData.tags,
			"id"
		)

		const { added: addedGroups, removed: removedGroups } = filterByKey(
			assignedGroups,
			Array.isArray(formData.groups) ? formData.groups : [],
			"id"
		)

		if (addedTags.length || removedTags.length || addedGroups.length || removedGroups.length) {
			const newTagIds = await resolveTagIds(addedTags)

			const response = await updateProfileSettings({
				variables: {
					userId: userId,
					assignedTagIds: newTagIds,
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
			refetchTags()
			return addAlert("Seuranta asetukset päivitetty onnistuneesti")
		}
		addAlert("Mitään päivitettävää ei ole valittu", "info")
	};

	type FormData = typeof initialState;

	const onChange =
		<K extends keyof FormData, T extends Item>(
			field: K,
			setState: React.Dispatch<React.SetStateAction<FormData>>
		) =>
			(_: React.SyntheticEvent, values: Array<T | string>) => {
				setState((prev) => ({
					...prev,
					[field]: normalizeValues(values),
				}));
			};

	// Fetch existing assigns to for form initialize data
	useEffect(() => {
		if (profileData && !profileLoading) {
			const assignedTags = profileData?.assignedTags?.tags?.map((tag: TagData) => ({
				id: tag.id,
				name: tag.name,
				__isNew: false,
			}))
			const assignedGroups = profileData?.assignedStudentGroups?.studentGroups?.map((group: StudentGroupData) => ({
				id: group.groupId,
				name: group.groupId
			}))

			setFormData(prev => ({
				...prev,
				tags: assignedTags,
				groups: assignedGroups
			}))
		}
	}, [profileData, profileLoading])

	return (
		<Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
			<Typography variant="h5" gutterBottom>
				Seuranta-asetukset
			</Typography>
			<Autocomplete
				sx={{ mb: 2 }}
				multiple
				disableListWrap
				freeSolo
				id="tags"
				options={tagOptions}
				value={formData.tags}
				isOptionEqualToValue={(o, v) => o.id === v.id}
				onChange={onChange("tags", setFormData)}
				filterSelectedOptions
				getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
				defaultValue={formData.tags}
				disableClearable
				noOptionsText="Ei tageja valittavana"
				renderInput={(params) => (
					<TextField
						{...params}
						variant="outlined"
						label="Tagit"
						placeholder="Valitse tai lisää uusi tagi"
					/>
				)}
			/>

			<Autocomplete
				sx={{ mb: 2 }}
				multiple
				disableListWrap
				id="groups"
				options={groupOptions}
				value={formData.groups}
				isOptionEqualToValue={(o, v) => o.id === v.id}
				onChange={onChange("groups", setFormData)}
				filterSelectedOptions
				getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
				defaultValue={formData.groups}
				disableClearable
				noOptionsText="Ei ryhmiä valittavana"
				renderInput={(params) => (
					<TextField
						{...params}
						variant="outlined"
						label="Ryhmä(t)"
					/>
				)}
			/>

			<Autocomplete
				sx={{ mb: 2 }}
				multiple
				disableListWrap
				id="includedInParts"
				options={themeOptions}
				value={formData.includedInParts}
				isOptionEqualToValue={(o, v) => o.id === v.id}
				onChange={onChange("includedInParts", setFormData)}
				filterSelectedOptions
				getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
				defaultValue={formData.includedInParts}
				disableClearable
				noOptionsText="Ei tutkinnonosia valittavana"
				renderInput={(params) => (
					<TextField
						{...params}
						variant="outlined"
						label="Tutkinnonosat"
					/>
				)}
			/>

			<Button onClick={handleSubmit} variant="contained" sx={{ mt: 3 }}>
				Tallenna muutokset
			</Button>
		</Box>
	);
};

export default TeacherProfileSettings;
