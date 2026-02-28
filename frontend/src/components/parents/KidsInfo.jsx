const KidsInfo = () => {
  const kids = [
    {
      name: "Jessia Rose",
      gender: "Female",
      class: "2",
      roll: "#2225",
      section: "A",
      admissionId: "#0021",
      admissionDate: "07.08.2017",
    },
    {
      name: "Jack Steve",
      gender: "Male",
      class: "3",
      roll: "#2205",
      section: "A",
      admissionId: "#0045",
      admissionDate: "07.08.2017",
    },
  ];

  return (
    <div className="col-span-4 bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">My Kids</h2>
      {kids.map((kid, index) => (
        <div
          key={index}
          className="flex items-start gap-6 p-4 bg-gray-50 rounded-md mb-4 shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-red-200 flex items-center justify-center text-3xl">
            {kid.gender === "Female" ? "👧" : "👦"}
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm w-full">
            <p className="font-medium text-gray-700">Name:</p>
            <p>{kid.name}</p>

            <p className="font-medium text-gray-700">Gender:</p>
            <p>{kid.gender}</p>

            <p className="font-medium text-gray-700">Class:</p>
            <p>{kid.class}</p>

            <p className="font-medium text-gray-700">Roll:</p>
            <p>{kid.roll}</p>

            <p className="font-medium text-gray-700">Section:</p>
            <p>{kid.section}</p>

            <p className="font-medium text-gray-700">Admission Id:</p>
            <p>{kid.admissionId}</p>

            <p className="font-medium text-gray-700">Admission Date:</p>
            <p>{kid.admissionDate}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KidsInfo;
