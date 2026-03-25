import MarksheetFilters from './MarksheetFilters';

function FillMarksheet() {
  const handleFiltersChange = (newFilters) => {
    // Optional: Can be used for other purposes if needed
    // MarksheetForm is now rendered inside MarksheetFilters
    console.log('Filters changed:', newFilters);
  };

  return (
    <div className="p-6 min-h-screen w-full">
      <div className="w-full container mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Fill Marksheet</h1>
        {/* Filters Component - Now includes MarksheetForm when student is selected */}
        <MarksheetFilters onFiltersChange={handleFiltersChange} />
      </div>
    </div>
  );
}

export default FillMarksheet;