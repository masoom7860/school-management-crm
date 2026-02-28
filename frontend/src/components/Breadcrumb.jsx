const Breadcrumb = ({ currentPage }) => {
    return (
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <span className="text-gray-500">Home</span>
            <span className="mx-1 text-gray-400">›</span>
            <span className="text-yellow-600 font-medium">{currentPage}</span>
        </div>
    );

};
export default Breadcrumb;