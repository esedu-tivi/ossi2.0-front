import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable, { type TableHeaderCell } from '../data-table';
import { TableBody, TableRow, TableCell } from '@/components/ui/table';

interface TestItem {
  id: number;
  name: string;
  city: string;
}

const sampleData: TestItem[] = [
  { id: 1, name: 'Anna', city: 'Helsinki' },
  { id: 2, name: 'Bertta', city: 'Tampere' },
  { id: 3, name: 'Cecilia', city: 'Turku' },
];

const headerCells: readonly TableHeaderCell[] = [
  { id: 'search', type: 'search', searchPath: 'name' },
  { id: 'name', type: 'sort', label: 'Nimi', sortPath: 'name' },
  { id: 'city', type: 'none', label: 'Kaupunki' },
] as const;

const renderRows = (data: TestItem[]) => (
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.city}</TableCell>
      </TableRow>
    ))}
  </TableBody>
);

describe('DataTable', () => {
  it('renders table with header cells and data', () => {
    render(
      <DataTable headerCells={headerCells} data={sampleData}>
        {renderRows}
      </DataTable>
    );

    expect(screen.getByText('Nimi')).toBeInTheDocument();
    expect(screen.getByText('Kaupunki')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Hae...')).toBeInTheDocument();

    expect(screen.getByText('Anna')).toBeInTheDocument();
    expect(screen.getByText('Bertta')).toBeInTheDocument();
    expect(screen.getByText('Cecilia')).toBeInTheDocument();
  });

  it('filters rows when typing in search input', async () => {
    const user = userEvent.setup();

    render(
      <DataTable headerCells={headerCells} data={sampleData}>
        {renderRows}
      </DataTable>
    );

    const searchInput = screen.getByPlaceholderText('Hae...');
    await user.type(searchInput, 'Anna');

    expect(screen.getByText('Anna')).toBeInTheDocument();
    expect(screen.queryByText('Bertta')).not.toBeInTheDocument();
    expect(screen.queryByText('Cecilia')).not.toBeInTheDocument();
  });

  it('toggles sort order on sort column click: asc -> desc -> none', async () => {
    const user = userEvent.setup();

    const renderFn = vi.fn(renderRows);

    render(
      <DataTable headerCells={headerCells} data={sampleData}>
        {renderFn}
      </DataTable>
    );

    const sortHeader = screen.getByText('Nimi');

    // Initial render: unsorted
    const initialCall = renderFn.mock.calls[0][0] as TestItem[];
    expect(initialCall.map((d) => d.name)).toEqual(['Anna', 'Bertta', 'Cecilia']);

    // Click 1: asc
    await user.click(sortHeader);
    const ascCall = renderFn.mock.calls.at(-1)![0] as TestItem[];
    expect(ascCall.map((d) => d.name)).toEqual(['Anna', 'Bertta', 'Cecilia']);

    // Click 2: desc
    await user.click(sortHeader);
    const descCall = renderFn.mock.calls.at(-1)![0] as TestItem[];
    expect(descCall.map((d) => d.name)).toEqual(['Cecilia', 'Bertta', 'Anna']);

    // Click 3: none (back to original order)
    await user.click(sortHeader);
    const noneCall = renderFn.mock.calls.at(-1)![0] as TestItem[];
    expect(noneCall.map((d) => d.name)).toEqual(['Anna', 'Bertta', 'Cecilia']);
  });

  it('renders children function with sorted/filtered data', () => {
    const childrenFn = vi.fn(() => (
      <TableBody>
        <TableRow>
          <TableCell>test</TableCell>
        </TableRow>
      </TableBody>
    ));

    render(
      <DataTable headerCells={headerCells} data={sampleData}>
        {childrenFn}
      </DataTable>
    );

    expect(childrenFn).toHaveBeenCalledWith(sampleData);
  });

  it('handles empty data array', () => {
    render(
      <DataTable headerCells={headerCells} data={[]}>
        {(data: TestItem[]) => (
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </DataTable>
    );

    expect(screen.getByText('Nimi')).toBeInTheDocument();
    expect(screen.getByText('Kaupunki')).toBeInTheDocument();
    // No data rows rendered
    const table = screen.getByRole('table');
    const tbody = table.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
    expect(tbody!.children).toHaveLength(0);
  });
});
