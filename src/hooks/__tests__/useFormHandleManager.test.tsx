import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useLazyQuery: vi.fn(() => [vi.fn(), { data: null, loading: false }]),
  };
});

import { useFormHandleManager } from '../useFormHandleManager';

const createInitialState = () => ({
  name: '',
  duration: 0,
  isActive: true,
  tags: [],
  competenceRequirements: [],
  includedInParts: [],
  description: '',
  materials: '',
});

describe('useFormHandleManager', () => {
  it('returns formData matching initial state', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    expect(result.current.formData).toEqual(initialState);
  });

  it('handleChange updates text fields', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Test Project' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.name).toBe('Test Project');
  });

  it('handleChange converts duration to number', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    act(() => {
      result.current.handleChange({
        target: { name: 'duration', value: '42' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.duration).toBe(42);
  });

  it('handleChange handles empty duration as empty string', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    act(() => {
      result.current.handleChange({
        target: { name: 'duration', value: '' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.duration).toBe('');
  });

  it('handleToggleActivity toggles isActive', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    // Initially true
    expect(result.current.formData.isActive).toBe(true);

    act(() => {
      result.current.handleToggleActivity({
        target: { checked: false },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.isActive).toBe(false);

    act(() => {
      result.current.handleToggleActivity({
        target: { checked: true },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.isActive).toBe(true);
  });

  it('handleEditorChange updates description', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    act(() => {
      result.current.handleEditorChange('<p>Hello world</p>', 'description');
    });

    expect(result.current.formData.description).toBe('<p>Hello world</p>');
  });

  it('handleEditorChange updates materials', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    act(() => {
      result.current.handleEditorChange('<p>Materials content</p>', 'materials');
    });

    expect(result.current.formData.materials).toBe('<p>Materials content</p>');
  });

  it('handleAddItem opens selector for tags', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    expect(result.current.selectorOpen).toBe(false);

    act(() => {
      result.current.handleAddItem('tags');
    });

    expect(result.current.selectorOpen).toBe(true);
    expect(result.current.currentField).toBe('tags');
  });

  it('handleAddItem opens selector for includedInParts', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    act(() => {
      result.current.handleAddItem('includedInParts');
    });

    expect(result.current.selectorOpen).toBe(true);
    expect(result.current.currentField).toBe('includedInParts');
  });

  it('handleAddItem for competenceRequirements shows alert when no parts selected', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    act(() => {
      result.current.handleAddItem('competenceRequirements');
    });

    expect(alertSpy).toHaveBeenCalledWith('Valitse ensin Teema.');
    expect(result.current.selectorOpen).toBe(false);

    alertSpy.mockRestore();
  });

  it('handleAdd updates tags and closes selector', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    // First open the selector for tags
    act(() => {
      result.current.handleAddItem('tags');
    });

    const items = [
      { id: '1', name: 'Tag 1' },
      { id: '2', name: 'Tag 2' },
    ];

    act(() => {
      result.current.handleAdd(items);
    });

    expect(result.current.formData.tags).toEqual(items);
    expect(result.current.selectorOpen).toBe(false);
  });

  it('returns all expected functions and state', () => {
    const initialState = createInitialState();
    const { result } = renderHook(() => useFormHandleManager(initialState));

    expect(result.current).toHaveProperty('formData');
    expect(result.current).toHaveProperty('setFormData');
    expect(result.current).toHaveProperty('selectedItems');
    expect(result.current).toHaveProperty('setSelectedItems');
    expect(result.current).toHaveProperty('selectorOpen');
    expect(result.current).toHaveProperty('setSelectorOpen');
    expect(result.current).toHaveProperty('currentField');
    expect(result.current).toHaveProperty('setCurrentField');
    expect(result.current).toHaveProperty('handleChange');
    expect(result.current).toHaveProperty('handleToggleActivity');
    expect(result.current).toHaveProperty('handleAdd');
    expect(result.current).toHaveProperty('handleAddItem');
    expect(result.current).toHaveProperty('handleEditorChange');
    expect(result.current).toHaveProperty('handleNotifyStudents');
    expect(result.current).toHaveProperty('competenceOptions');
    expect(result.current).toHaveProperty('setCompetenceOptions');
    expect(result.current).toHaveProperty('handleChangeTeema');
  });
});
