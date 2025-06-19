import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModuleList from '../components/ModuleList';

describe('ModuleList Component', () => {
  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  const renderItem = (item: (typeof mockData)[0]) => (
    <div data-testid={`item-${item.id}`}>{item.name}</div>
  );

  const getKey = (item: (typeof mockData)[0]) => item.id;

  it('renders all items from the data array', () => {
    render(<ModuleList data={mockData} renderItem={renderItem} getKey={getKey} />);

    mockData.forEach(item => {
      expect(screen.getByTestId(`item-${item.id}`)).toBeInTheDocument();
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  it('applies correct styling classes', () => {
    render(<ModuleList data={mockData} renderItem={renderItem} getKey={getKey} />);

    const list = screen.getByRole('list');
    expect(list).toHaveClass(
      'border-l-4',
      'border-blue',
      'rounded-md',
      'shadow-sm',
      'divide-y',
      'divide-gray-100',
      'w-full',
      'mx-auto',
      'bg-white',
      'space-y-2',
    );
  });

  it('applies alternating background colors', () => {
    render(<ModuleList data={mockData} renderItem={renderItem} getKey={getKey} />);

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveClass('bg-white');
    expect(items[1]).toHaveClass('bg-lightBlue');
    expect(items[2]).toHaveClass('bg-white');
  });
});
