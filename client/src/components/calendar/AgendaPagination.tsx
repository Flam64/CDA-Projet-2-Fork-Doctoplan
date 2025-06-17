import PaginationControls from './PaginationControls';

type AgendaPaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  isMobile: boolean;
};

export default function AgendaPagination({
  currentPage,
  onPageChange,
  pageSize,
  totalItems,
  isMobile,
}: AgendaPaginationProps) {
  return (
    <PaginationControls
      currentPage={currentPage}
      onPageChange={onPageChange}
      pageSize={pageSize}
      totalItems={totalItems}
      className={isMobile ? 'mb-4' : ''}
    />
  );
}
