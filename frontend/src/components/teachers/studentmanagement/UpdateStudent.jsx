import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import html2pdf from 'html2pdf.js'; // Import html2pdf.js
import { getSectionsByClass } from '../../../api/classesApi';
import DeleteConfirmationModal from '../../common/DeleteConfirmationModal'; // Import the modal component
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import ImageUploader from '../../common/ImageUploader';

// Reusing the form section components from the original file
const StudentBasicInfoSection = ({ formData, handleChange, errors, previewImages, renderField, renderFileInput, sections }) => {
    const isTeacher = localStorage.getItem('role') === 'teacher';
    return (
    <div className="bg-white shadow-md rounded-lg mb-4">
        <div className="px-4 py-3 border-b border-gray-200 rounded-t-lg bg-red-600 text-white">
            <h4 className="text-lg font-semibold">Student Basic Information</h4>
        </div>
        <div className="p-4">
            <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 px-2">
                    {renderFileInput('profilePhoto', 'Profile Photo', 'profilePhoto')}
                    {renderField('name', 'Full Name', 'text', [], true)}
                    {renderField('email', 'Email', 'email')}
                    {renderField('password', 'Password (leave blank to keep same)', 'password')}
                    {renderField('dob', 'Date of Birth', 'date', [], true)}
                    {renderField('gender', 'Gender', 'dropdown', ['Male', 'Female', 'Other'], true)}
                    {renderField('applicationNumber', 'Application Number', 'text', [], false, true)} {/* Added readOnly */}
                    {renderField('scholarNumber', 'Scholar Number')}
                </div>
                <div className="w-full md:w-1/2 px-2">
                    {renderField('classAppliedFor', 'Class Applied For', 'dropdown', [], true)} {/* Removed hardcoded options, added required */}
                    {renderField('section', 'Section', 'dropdown', sections, true)}
                    {!isTeacher && renderField('classTeacherId', 'Assign Teacher', 'dropdown', [], false)} {/* Added Assign Teacher field */}
                    {renderField('admissionDate', 'Admission Date', 'date')}
                    {renderField('bloodGroup', 'Blood Group', 'dropdown', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])}
                    {renderField('placeOfBirth', 'Place of Birth')}
                    {renderField('nationality', 'Nationality', 'dropdown', ["Indian", "American", "British", "Canadian", "Australian", "Other"])}
                    {renderField('religion', 'Religion', 'dropdown', ["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Other"])}
                </div>
            </div>
        </div>
    </div>
);
}

const StudentAcademicInfoSection = ({ formData, handleChange, errors, renderField }) => (
    <div className="bg-white shadow-md rounded-lg mb-4">
        <div className="px-4 py-3 border-b border-gray-200 rounded-t-lg bg-red-600 text-white">
            <h4 className="text-lg font-semibold">Student Academic Information</h4>
        </div>
        <div className="p-4">
            <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 px-2">
                    {renderField('currentSchoolStatus', 'Currently in School', 'checkbox')}
                    {renderField('currentSchoolName', 'Current School Name')}
                    {renderField('currentSchoolClass', 'Current School Class')}
                    {renderField('rollNumber', 'Roll Number', 'number')}
                </div>
            </div>
        </div>
    </div>
);

const MedicalInfoSection = ({ formData, handleChange, errors, renderField }) => (
    <div className="bg-white shadow-md rounded-lg mb-4">
        <div className="px-4 py-3 border-b border-gray-200 rounded-t-lg bg-red-600 text-white">
            <h4 className="text-lg font-semibold">Medical Information</h4>
        </div>
        <div className="p-4">
            <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 px-2">
                    {renderField('medicalInfo.hasCondition', 'Has Medical Condition', 'checkbox')}
                    {renderField('medicalInfo.needsUrgentCare', 'Needs Urgent Care', 'checkbox')}
                    {renderField('medicalInfo.conditionDetails', 'Condition Details', 'textarea')}
                </div>
                <div className="w-full md:w-1/2 px-2">
                    {renderField('medicalInfo.schoolSupportNeeded', 'School Support Needed')}
                    {renderField('medicalInfo.bloodGroup', 'Medical Blood Group', 'dropdown', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])}
                </div>
            </div>
        </div>
    </div>
);

const ParentInfoSection = ({ parentType, formData, handleChange, errors, previewImages, renderField, renderFileInput }) => {
    const capitalizedParent = parentType.charAt(0).toUpperCase() + parentType.slice(1);
    const photoKey = `${parentType}Photo`;

    return (
        <div className="bg-white shadow-md rounded-lg mb-4">
            <div className="px-4 py-3 border-b border-gray-200 rounded-t-lg bg-red-600 text-white">
                <h4 className="text-lg font-semibold">{capitalizedParent}'s Information</h4>
            </div>
            <div className="p-4">
                <div className="flex flex-wrap -mx-2">
                    <div className="w-full md:w-1/2 px-2">
                        {renderFileInput(`parentData.${parentType}.photo`, `${capitalizedParent}'s Photo`, photoKey)}
                        {renderField(`parentData.${parentType}.name`, `${capitalizedParent}'s Name`)}
                        {parentType === 'guardian' && renderField(`parentData.${parentType}.relation`, `${capitalizedParent}'s Relation`, 'dropdown', ["Parent", "Grandparent", "Aunt", "Uncle", "Other"])}
                        {renderField(`parentData.${parentType}.email`, `${capitalizedParent}'s Email`, 'email')}
                        {renderField(`parentData.${parentType}.mobile`, `${capitalizedParent}'s Mobile`)}
                        {renderField(`parentData.${parentType}.bloodGroup`, `${capitalizedParent}'s Blood Group`, 'dropdown', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])}
                    </div>
                    <div className="w-full md:w-1/2 px-2">
                        {renderField(`parentData.${parentType}.occupation`, `${capitalizedParent}'s Occupation`)}
                        {renderField(`parentData.${parentType}.maritalStatus`, `${capitalizedParent}'s Marital Status`, 'dropdown', ['Single', 'Married', 'Divorced', 'Widowed'])}
                        {renderField(`parentData.${parentType}.department`, `${capitalizedParent}'s Department`)}
                        {renderField(`parentData.${parentType}.organization`, `${capitalizedParent}'s Organization`)}
                        {renderField(`parentData.${parentType}.designation`, `${capitalizedParent}'s Designation`)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmergencyContactSection = ({ formData, handleChange, errors, renderField }) => (
    <div className="bg-white shadow-md rounded-lg mb-4">
        <div className="px-4 py-3 border-b border-gray-200 rounded-t-lg bg-red-600 text-white">
            <h4 className="text-lg font-semibold">Emergency Contact</h4>
        </div>
        <div className="p-4">
            <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 px-2">
                    {renderField('parentData.emergencyContact.name', 'Emergency Contact Name', 'text', [], true)}
                    {renderField('parentData.emergencyContact.relation', 'Relationship', 'dropdown', ["Parent", "Grandparent", "Aunt", "Uncle", "Other"], true)}
                    {renderField('parentData.emergencyContact.phone', 'Emergency Contact Phone', 'text', [], true)}
                </div>
            </div>
        </div>
    </div>
);


const UpdateStudent = () => {
    // Move all useState hooks to the top
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [schoolData, setSchoolData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [sections, setSections] = useState([]);
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(false);
    const [classesError, setClassesError] = useState(null);
    const [formData, setFormData] = useState({
        // Student fields - Initial state for the form
        name: '',
        email: '',
        dob: '',
        gender: '',
        applicationNumber: '',
        scholarNumber: '',
        classAppliedFor: '',
        section: '',
        classTeacherId: '',
        admissionDate: '',
        profilePhoto: null,
        bloodGroup: '',
        placeOfBirth: '',
        nationality: '',
        religion: '',
        category: '',
        aadharNumber: '',
        residentialAddress: '',
        permanentAddress: '',
        legalCustodian: '',
        languagesSpoken: { primary: '', secondary: '' },
        familyMembersCount: 0,
        stayingWithGrandparents: false,
        familyType: '',
        familyIncome: '',
        yearsInCity: '',
        currentSchoolStatus: false,
        currentSchoolName: '',
        currentSchoolClass: '',
        rollNumber: 0,
        medicalInfo: {
            hasCondition: false,
            needsUrgentCare: false,
            conditionDetails: '',
            schoolSupportNeeded: '',
            bloodGroup: ''
        },
        siblingInfo: {
            name: '',
            scholarNumber: '',
            class: '',
            joiningYear: '',
            currentSchool: '',
            currentGrade: '',
            gender: '',
            age: ''
        },
        previousSchools: [{
            year: '',
            name: '',
            classAttended: '',
            reasonForLeaving: '',
            leavingDate: ''
        }],
        insightForm: {
            physicalBeing: '',
            languageRole: '',
            emotionalSupport: '',
            coCurricularOpinion: '',
            collaborationOpinion: '',
            curiositySupport: '',
            childInterest: '',
            moralEnvironment: '',
            consciousTransformation: '',
            teacherParentConnection: '',
            techOpinion: '',
            languageAppsExperience: '',
            childActivities: '',
            favoriteSubjects: '',
            weakSubjects: '',
            reasonForShiftingSchool: '',
            appealOf: ''
        },
        parentData: {
            father: {
                name: '',
                photo: null,
                email: '',
                mobile: '',
                bloodGroup: '',
                occupation: '',
                maritalStatus: '',
                department: '',
                organization: '',
                designation: '',
                annualIncome: '',
                itrFiled: false,
                itrSince: '',
                education: {
                    doctorate: '',
                    pg: '',
                    graduate: '',
                    highSchool: ''
                }
            },
            mother: {
                name: '',
                photo: null,
                email: '',
                mobile: '',
                bloodGroup: '',
                occupation: '',
                maritalStatus: '',
                department: '',
                organization: '',
                designation: '',
                annualIncome: '',
                itrFiled: false,
                itrSince: '',
                education: {
                    doctorate: '',
                    pg: '',
                    graduate: '',
                    highSchool: ''
                }
            },
            guardian: {
                name: '',
                photo: null,
                relation: '',
                email: '',
                mobile: '',
                bloodGroup: '',
                occupation: '',
                maritalStatus: '',
                department: '',
                organization: '',
                designation: '',
                annualIncome: '',
                itrFiled: false,
                itrSince: '',
                education: {
                    doctorate: '',
                    pg: '',
                    graduate: '',
                    highSchool: ''
                }
            },
            emergencyContact: {
                name: '',
                relation: '',
                phone: ''
            }
        }
    });
    const [previewImages, setPreviewImages] = useState({
        profilePhoto: '',
        fatherPhoto: '',
        motherPhoto: '',
        guardianPhoto: ''
    });
    const [teachers, setTeachers] = useState([]);
    const [teacherLoading, setTeacherLoading] = useState(true);
    const [teacherError, setTeacherError] = useState(null);

    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');
    const decoded = token ? jwtDecode(token) : null;
    const schoolId = decoded?.schoolId;

    // Combine loading and error states
    const isLoading = classesLoading;
    const error = classesError;

    // Helper: get unique class names with null check
    const uniqueClassNames = Array.isArray(classes) 
        ? [...new Set(classes.filter(cls => cls?.className).map(cls => cls.className))]
        : [];

    // Helper: get display string for class (by className) with null check
    const getClassDisplayString = (classValue) => {
        if (!Array.isArray(classes) || !classValue) return String(classValue || '');
        // Find the class object by its _id and return className
        const classObj = classes.find(cls => cls && (cls._id === classValue || cls.className === classValue));
        return classObj ? (classObj.className || String(classValue)) : String(classValue);
    };

    const normalizeToString = (val) => {
        if (val === null || val === undefined) return '';
        return typeof val === 'string' ? val : String(val);
    };

    const isValidObjectId = (value) => {
        const str = normalizeToString(value);
        return /^[a-fA-F0-9]{24}$/.test(str);
    };

    const resolveClassId = (value) => {
        if (!value) return '';
        if (typeof value === 'object') {
            return value._id ? normalizeToString(value._id) : '';
        }

        const normalizedValue = normalizeToString(value);
        if (isValidObjectId(normalizedValue)) {
            return normalizedValue;
        }

        if (!Array.isArray(classes)) return '';
        const match = classes.find(cls => {
            if (!cls) return false;
            const id = normalizeToString(cls._id);
            const name = normalizeToString(cls.className);
            return id === normalizedValue || name === normalizedValue;
        });

        return match ? normalizeToString(match._id) : '';
    };

    const resolveSectionId = (value, availableSections = []) => {
        if (!value) return '';
        if (typeof value === 'object') {
            return value._id ? normalizeToString(value._id) : '';
        }

        const normalizedValue = normalizeToString(value);
        if (isValidObjectId(normalizedValue)) {
            return normalizedValue;
        }

        if (!Array.isArray(availableSections)) return '';
        const match = availableSections.find(sec => {
            if (!sec) return false;
            const id = normalizeToString(sec._id);
            const name = normalizeToString(sec.name);
            return id === normalizedValue || name === normalizedValue;
        });

        return match ? normalizeToString(match._id) : '';
    };

    // Filter students based on search term and filters
    const filteredStudents = (students || []).filter(student => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const matchesSearch =
            student.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            student.applicationNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
            student.email.toLowerCase().includes(lowerCaseSearchTerm);

        // Filter by class/section IDs if present, otherwise fallback to strings
        const studentClassId = student.classId && (student.classId._id || student.classId);
        const studentSectionName = student.sectionId?.name || student.section;
        const matchesClass = filterClass === '' || studentClassId === filterClass || student.classAppliedFor === filterClass;
        const studentSectionId = student.sectionId && (student.sectionId._id || student.sectionId);
        const matchesSection = filterSection === '' || studentSectionId === filterSection || student.section === filterSection;

        return matchesSearch && matchesClass && matchesSection;
    });

    // Fetch students, school, teachers, and classes
    useEffect(() => {
        const fetchAllData = async () => {
            if (!schoolId) {
                console.error("School ID not found in token.");
                setTeacherLoading(false);
                return;
            }
            try {
                // Fetch students
                const role = localStorage.getItem('role');
                const teacherId = localStorage.getItem('teacherId');
                let studentsResponse;
                if (role === 'teacher' && teacherId) {
                    studentsResponse = await axios.get(`${BASE_URL}/api/students/teacher/${teacherId}/students`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'School-ID': schoolId
                        }
                    });
                } else {
                    studentsResponse = await axios.get(`${BASE_URL}/api/students/get/${schoolId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                }
                setStudents(studentsResponse.data.students);

                // Fetch school data
                const schoolResponse = await axios.get(`${BASE_URL}/registerSchool/get/${schoolId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSchoolData(schoolResponse.data.school);

                // Fetch teachers
                setTeacherLoading(true);
                const teachersResponse = await axios.get(`${BASE_URL}/api/teachers/all/${schoolId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTeachers(teachersResponse.data.teachers);
                setTeacherLoading(false);

                // Fetch classes
                setClassesLoading(true);
                setClassesError(null);
                const { getClasses } = await import('../../../api/classesApi');
                const classesResponse = await getClasses();
                setClasses(classesResponse || []);
                setClassesLoading(false);

                console.log('Fetched classes:', classes);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data.');
                setTeacherError('Failed to load teachers or other data.');
                setTeacherLoading(false);
                setClassesError('Failed to load classes.');
                setClassesLoading(false);
            }
        };
        fetchAllData();
    }, [schoolId, token, BASE_URL]);

    useEffect(() => { console.log('Classes:', classes); }, [classes]);

    // Fetch sections from backend when selected class changes
    useEffect(() => {
        const fetchSectionsForSelectedClass = async () => {
            const classIdForFetch = resolveClassId(formData.classAppliedFor);

            if (!classIdForFetch) {
                setSections([]);
                return;
            }

            if (formData.classAppliedFor !== classIdForFetch) {
                setFormData(prev => ({
                    ...prev,
                    classAppliedFor: classIdForFetch,
                }));
                return;
            }

            try {
                const response = await getSectionsByClass(classIdForFetch);
                const sectionList = Array.isArray(response)
                    ? response
                    : (response?.sections || []);
                const sortedSections = [...sectionList].sort((a, b) =>
                    normalizeToString(a.name).localeCompare(normalizeToString(b.name))
                );
                setSections(sortedSections);
            } catch (err) {
                console.error('Error fetching sections for class:', err);
                setSections([]);
            }
        };

        fetchSectionsForSelectedClass();
    }, [formData.classAppliedFor, classes]);

    useEffect(() => {
        if (!formData.section) return;

        const resolvedSectionId = resolveSectionId(formData.section, sections);
        if (resolvedSectionId && resolvedSectionId !== formData.section) {
            setFormData(prev => ({
                ...prev,
                section: resolvedSectionId,
            }));
        }
    }, [sections, formData.section]);

    const isAbsoluteUrl = (url) => {
        return /^(https?:\/\/)/i.test(url);
    };

    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (isAbsoluteUrl(url)) {
            return url;
        }
        // Remove leading slash if present to avoid double slashes
        const cleanUrl = url.replace(/^\//, '');
        return `${BASE_URL}/${cleanUrl}`;
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        // Populate the form with the selected student's data by explicitly picking fields
        const newFormData = {
            // Student fields
            name: student.name || '',
            email: student.email || '',
            dob: student.dob ? student.dob.substring(0, 10) : '', // Format date for input
            gender: student.gender || '',
            applicationNumber: student.applicationNumber || '',
            scholarNumber: student.scholarNumber || '',
            classAppliedFor: resolveClassId(student.classId || student.classAppliedFor) || student.classAppliedFor || '',
            section: (student.sectionId && (student.sectionId._id || student.sectionId)) || student.section || '',
            classTeacherId: (student.classTeacherId && (student.classTeacherId._id || student.classTeacherId)) || '', // Populate classTeacherId
            admissionDate: student.admissionDate ? student.admissionDate.substring(0, 10) : '', // Format date for input
            profilePhoto: null, // File input should be null initially
            bloodGroup: student.bloodGroup || '',
            placeOfBirth: student.placeOfBirth || '',
            nationality: student.nationality || '',
            religion: student.religion || '',
            category: student.category || '',
            aadharNumber: student.aadharNumber || '',
            residentialAddress: student.residentialAddress || '',
            permanentAddress: student.permanentAddress || '',
            legalCustodian: student.legalCustodian || '',
            languagesSpoken: {
                primary: student.languagesSpoken?.primary || '',
                secondary: student.languagesSpoken?.secondary || ''
            },
            familyMembersCount: student.familyMembersCount || 0,
            stayingWithGrandparents: student.stayingWithGrandparents || false,
            familyType: '',
            familyIncome: '',
            yearsInCity: '',
            currentSchoolStatus: student.currentSchoolStatus || false,
            currentSchoolName: student.currentSchoolName || '',
            currentSchoolClass: student.currentSchoolClass || '',
            rollNumber: student.rollNumber || 0,
            medicalInfo: {
                hasCondition: student.medicalInfo?.hasCondition || false,
                needsUrgentCare: student.medicalInfo?.needsUrgentCare || false,
                conditionDetails: student.medicalInfo?.conditionDetails || '',
                schoolSupportNeeded: student.medicalInfo?.schoolSupportNeeded || '',
                bloodGroup: student.medicalInfo?.bloodGroup || ''
            },
            siblingInfo: {
                name: student.siblingInfo?.name || '',
                scholarNumber: student.siblingInfo?.scholarNumber || '',
                class: student.siblingInfo?.class || '',
                joiningYear: student.siblingInfo?.joiningYear || '',
                currentSchool: student.siblingInfo?.currentSchool || '',
                currentGrade: student.siblingInfo?.currentGrade || '',
                gender: student.siblingInfo?.gender || '',
                age: student.siblingInfo?.age || ''
            },
            previousSchools: student.previousSchools || [], // Assuming previousSchools is an array
            insightForm: {
                physicalBeing: student.insightForm?.physicalBeing || '',
                languageRole: student.insightForm?.languageRole || '',
                emotionalSupport: student.insightForm?.emotionalSupport || '',
                coCurricularOpinion: student.insightForm?.coCurricularOpinion || '',
                collaborationOpinion: student.insightForm?.collaborationOpinion || '',
                curiositySupport: student.insightForm?.curiositySupport || '',
                childInterest: student.insightForm?.childInterest || '',
                moralEnvironment: student.insightForm?.moralEnvironment || '',
                consciousTransformation: student.insightForm?.consciousTransformation || '',
                teacherParentConnection: student.insightForm?.teacherParentConnection || '',
                techOpinion: student.insightForm?.techOpinion || '',
                languageAppsExperience: student.insightForm?.languageAppsExperience || '',
                childActivities: student.insightForm?.childActivities || '',
                favoriteSubjects: student.insightForm?.favoriteSubjects || '',
                weakSubjects: student.insightForm?.weakSubjects || '',
                reasonForShiftingSchool: student.insightForm?.reasonForShiftingSchool || '',
                appealOf: ''
            },

            // Parent fields (from student.parentId)
            parentData: {
                father: {
                    name: student.parentId?.father?.name || '',
                    photo: null, // File input should be null initially
                    email: student.parentId?.father?.email || '',
                    mobile: student.parentId?.father?.mobile || '',
                    bloodGroup: student.parentId?.father?.bloodGroup || '',
                    occupation: student.parentId?.father?.occupation || '',
                    maritalStatus: student.parentId?.father?.maritalStatus || '',
                    department: student.parentId?.father?.department || '',
                    organization: student.parentId?.father?.organization || '',
                    designation: student.parentId?.father?.designation || '',
                    annualIncome: student.parentId?.father?.annualIncome || '',
                    itrFiled: student.parentId?.father?.itrFiled || false,
                    itrSince: student.parentId?.father?.itrSince || '',
                    education: {
                        doctorate: student.parentId?.father?.education?.doctorate || '',
                        pg: student.parentId?.father?.education?.pg || '',
                        graduate: student.parentId?.father?.education?.graduate || '',
                        highSchool: student.parentId?.father?.education?.highSchool || ''
                    }
                },
                mother: {
                    name: student.parentId?.mother?.name || '',
                    photo: null, // File input should be null initially
                    email: student.parentId?.mother?.email || '',
                    mobile: student.parentId?.mother?.mobile || '',
                    bloodGroup: student.parentId?.mother?.bloodGroup || '',
                    occupation: student.parentId?.mother?.occupation || '',
                    maritalStatus: student.parentId?.mother?.maritalStatus || '',
                    department: student.parentId?.mother?.department || '',
                    organization: student.parentId?.mother?.organization || '',
                    designation: student.parentId?.mother?.designation || '',
                    annualIncome: student.parentId?.mother?.annualIncome || '',
                    itrFiled: student.parentId?.mother?.itrFiled || false,
                    itrSince: student.parentId?.mother?.itrSince || '',
                    education: {
                        doctorate: student.parentId?.mother?.education?.doctorate || '',
                        pg: student.parentId?.mother?.education?.pg || '',
                        graduate: student.parentId?.mother?.education?.graduate || '',
                        highSchool: student.parentId?.mother?.education?.highSchool || ''
                    }
                },
                guardian: {
                    name: student.parentId?.guardian?.name || '',
                    photo: null, // File input should be null initially
                    relation: student.parentId?.guardian?.relation || '',
                    email: student.parentId?.guardian?.email || '',
                    mobile: student.parentId?.guardian?.mobile || '',
                    bloodGroup: student.parentId?.guardian?.bloodGroup || '',
                    occupation: student.parentId?.guardian?.occupation || '',
                    maritalStatus: student.parentId?.guardian?.maritalStatus || '',
                    department: student.parentId?.guardian?.department || '',
                    organization: student.parentId?.guardian?.organization || '',
                    designation: student.parentId?.guardian?.designation || '',
                    annualIncome: student.parentId?.guardian?.annualIncome || '',
                    itrFiled: student.parentId?.guardian?.itrFiled || false,
                    itrSince: student.parentId?.guardian?.itrSince || '',
                    education: {
                        doctorate: student.parentId?.guardian?.education?.doctorate || '',
                        pg: student.parentId?.guardian?.education?.pg || '',
                        graduate: student.parentId?.guardian?.education?.graduate || '',
                        highSchool: student.parentId?.guardian?.education?.highSchool || ''
                    }
                },
                emergencyContact: {
                    name: student.parentId?.emergencyContact?.name || '',
                    relation: student.parentId?.emergencyContact?.relation || '',
                    phone: student.parentId?.emergencyContact?.phone || ''
                }
            }
        };
        setFormData(newFormData);

        // Set preview images from existing photo URLs
        setPreviewImages({
            profilePhoto: student.profilePhoto ? `${BASE_URL}/${student.profilePhoto}` : '',
            fatherPhoto: student.parentId?.father?.photo ? `${BASE_URL}/${student.parentId.father.photo}` : '',
            motherPhoto: student.parentId?.mother?.photo ? `${BASE_URL}/${student.parentId.mother.photo}` : '',
            guardianPhoto: student.parentId?.guardian?.photo ? `${BASE_URL}/${student.parentId.guardian.photo}` : ''
        });
        setErrors({}); // Clear previous errors
    };

    const handleDelete = async (studentId) => {
        setIsSubmitting(true);
        try {
            await axios.delete(`${BASE_URL}/api/students/delete/${studentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // alert('Student deleted successfully!');
            setSelectedStudent(null); // Clear selected student
            // Re-fetch students to update the list
            const role = localStorage.getItem('role');
            const teacherId = localStorage.getItem('teacherId');
            let studentsResponse;
            if (role === 'teacher' && teacherId) {
                studentsResponse = await axios.get(`${BASE_URL}/api/students/teacher/${teacherId}/students`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'School-ID': schoolId
                    }
                });
            } else {
                studentsResponse = await axios.get(`${BASE_URL}/api/students/get/${schoolId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            setStudents(studentsResponse.data.students);

        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete student. Please try again.');
        } finally {
            setIsSubmitting(false);
            setShowDeleteModal(false); // Close modal after action
            setItemToDeleteId(null); // Clear item to delete
        }
    };

    const openDeleteModal = (id) => {
        setItemToDeleteId(id);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setItemToDeleteId(null);
    };


    // Improved function to get nested value
    const getNestedValue = (obj, path) => {
        if (!path) return '';

        const parts = path.split('.');
        let current = obj;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            // Handle array notation: field[0].name
            if (part.includes('[') && part.includes(']')) {
                const arrayName = part.substring(0, part.indexOf('['));
                const indexMatch = part.match(/\[(\d+)\]/);
                if (!indexMatch) return '';

                const index = parseInt(indexMatch[1], 10);

                if (!current || !current[arrayName] || !Array.isArray(current[arrayName]) ||
                    !current[arrayName][index]) {
                    return '';
                }

                current = current[arrayName][index];
            } else {
                if (!current || current[part] === undefined) {
                    return '';
                }
                current = current[part];
            }
        }

        return current !== undefined && current !== null ? current : '';
    };

    // Improved function to update nested value
    const updateNestedValue = (obj, path, value) => {
        if (!path) return obj;

        const newObj = JSON.parse(JSON.stringify(obj)); // Deep clone
        const parts = path.split('.');
        let current = newObj;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];

            // Handle array notation: field[0].name
            if (part.includes('[') && part.includes(']')) {
                const arrayName = part.substring(0, part.indexOf('['));
                const indexMatch = part.match(/\[(\d+)\]/);
                if (!indexMatch) continue;

                const index = parseInt(indexMatch[1], 10);

                if (!current[arrayName]) {
                    current[arrayName] = [];
                }

                if (!Array.isArray(current[arrayName])) {
                    current[arrayName] = [];
                }

                if (!current[arrayName][index]) {
                    current[arrayName][index] = {};
                }

                current = current[arrayName][index];
            } else {
                if (!current[part] || typeof current[part] !== 'object') {
                    current[part] = {};
                }
                current = current[part];
            }
        }

        const lastPart = parts[parts.length - 1];
        current[lastPart] = value;

        return newObj;
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            let previewKey;

            if (name === 'profilePhoto') {
                previewKey = 'profilePhoto';
            } else if (name.includes('father')) {
                previewKey = 'fatherPhoto';
            } else if (name.includes('mother')) {
                previewKey = 'motherPhoto';
            } else if (name.includes('guardian')) {
                previewKey = 'guardianPhoto';
            }

            // Update preview
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImages(prev => ({
                        ...prev,
                        [previewKey]: reader.result
                    }));
                };
                reader.readAsDataURL(file);
            }

            // Update form data with the file
            const newFormData = updateNestedValue(
                formData,
                name,
                file
            );
            setFormData(newFormData);

        } else {
            // For other inputs, use the appropriate value based on type
            const newValue = type === 'checkbox' ? checked : value;
            const newFormData = updateNestedValue(
                formData,
                name,
                newValue
            );
            if (name === 'classAppliedFor') {
                newFormData.section = '';
            }
            setFormData(newFormData);
        }
    };

    const handlePhotoRemoval = (fieldName, previewKey) => {
        // Clear the file input in form data
        const newFormData = updateNestedValue(formData, fieldName, null);
        setFormData(newFormData);

        // Clear the preview
        setPreviewImages(prev => ({
            ...prev,
            [previewKey]: ''
        }));
    };

    // Basic validation function (can be expanded)
    const validateForm = () => {
        const newErrors = {};

        // Example validation rules (expand as needed)
        if (!formData.name) newErrors.name = 'Full name is required';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (formData.parentData.father?.mobile && !/^\d{10}$/.test(formData.parentData.father.mobile)) {
            newErrors['parentData.father.mobile'] = 'Father\'s mobile number must be 10 digits';
        }
        if (formData.parentData.mother?.mobile && !/^\d{10}$/.test(formData.parentData.mother.mobile)) {
            newErrors['parentData.mother.mobile'] = 'Mother\'s mobile number must be 10 digits';
        }
        if (formData.parentData.guardian?.mobile && !/^\d{10}$/.test(formData.parentData.guardian.mobile)) {
            newErrors['parentData.guardian.mobile'] = 'Guardian\'s mobile number must be 10 digits';
        }
        if (formData.parentData.emergencyContact?.phone && !/^\d{10}$/.test(formData.parentData.emergencyContact.phone)) {
            newErrors['parentData.emergencyContact.phone'] = 'Emergency contact phone number must be 10 digits';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting || !selectedStudent) return;

        if (!validateForm()) {
            window.scrollTo(0, 0);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const formDataToSend = new FormData();

            // Clone formData to avoid mutating the original
            const formDataCopy = JSON.parse(JSON.stringify(formData));

            // Function to flatten nested objects and append to FormData
            const appendFormData = (data, parentKey = '') => {
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const value = data[key];
                        const formKey = parentKey ? `${parentKey}.${key}` : key;

                        // Exclude file fields from this flattening process
                        if (formKey === 'profilePhoto' || formKey.startsWith('parentData.') && formKey.endsWith('.photo')) {
                            continue;
                        }

                        if (typeof value === 'object' && value !== null && !(value instanceof File)) {
                            // Recursively append nested objects/arrays
                            appendFormData(value, formKey);
                        } else if (value !== null && value !== undefined) {
                            // Append primitive values
                            formDataToSend.append(formKey, value);
                        }
                    }
                }
            };

            // Append all non-file data
            appendFormData(formDataCopy);

            // Append file objects separately if they exist and are File objects
            if (formData.profilePhoto instanceof File) {
                formDataToSend.append('profilePhoto', formData.profilePhoto);
            }
            // Handle parent photos similarly
            if (formData.parentData?.father?.photo instanceof File) {
                formDataToSend.append('fatherPhoto', formData.parentData.father.photo);
            }
            if (formData.parentData?.mother?.photo instanceof File) {
                formDataToSend.append('motherPhoto', formData.parentData.mother.photo);
            }
            if (formData.parentData?.guardian?.photo instanceof File) {
                formDataToSend.append('guardianPhoto', formData.parentData.guardian.photo);
            }


            const response = await axios.put(
                `${BASE_URL}/api/students/update/${selectedStudent._id}`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success('Student information updated successfully!');
            setSelectedStudent(null);
            const role = localStorage.getItem('role');
            const teacherId = localStorage.getItem('teacherId');
            let studentsResponse;
            if (role === 'teacher' && teacherId) {
                studentsResponse = await axios.get(`${BASE_URL}/api/students/teacher/${teacherId}/students`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'School-ID': schoolId
                    }
                });
            } else {
                studentsResponse = await axios.get(`${BASE_URL}/api/students/get/${schoolId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            setStudents(studentsResponse.data.students);

        } catch (error) {
            console.error('Update error:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Failed to update student. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (fieldName, label, type = 'text', options = [], required = false, readOnly = false) => {
        const value = getNestedValue(formData, fieldName);
        const error = errors[fieldName];

        return (
            <div className="mb-4" key={fieldName}>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>

                {type === 'dropdown' ? (
                    <select
                        name={fieldName}
                        value={value || ''}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${error ? 'border-red-500' : ''}`}
                        aria-label={label}
                        disabled={readOnly || (fieldName === 'classAppliedFor' && classesLoading) || (fieldName === 'section' && classesLoading)}
                    >
                        <option value="">Select {label}</option>
                        {/* Conditionally render options based on field name */}
                        {fieldName === 'classTeacherId' ? (
                            teachers.map(teacher => (
                                <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                            ))
                        ) : fieldName === 'classAppliedFor' ? (
                            Array.isArray(classes) ? classes.map(cls => (
                                cls && cls._id && cls.className && (
                                    <option key={cls._id} value={cls._id}>{cls.className}</option>
                                )
                            )) : (
                                <option disabled>Loading classes...</option>
                            )
                        ) : fieldName === 'section' ? (
                            sections.map((sec, idx) => (
                                <option key={sec._id || sec.name || idx} value={sec._id || sec.name}>
                                    {sec.name || sec._id}
                                </option>
                            ))
                        ) : (
                            options.map((option, idx) => (
                                <option key={option.value || option || idx} value={option.value || option}>
                                    {option.label || option}
                                </option>
                            ))
                        )}
                    </select>
                ) : type === 'checkbox' ? (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name={fieldName}
                            checked={value || false}
                            onChange={handleChange}
                            className={`mr-2 leading-tight ${error ? 'border-red-500' : ''}`}
                            aria-label={label}
                            disabled={readOnly} // Added disabled for readOnly
                        />
                        <span className="text-sm">
                            {label}
                        </span>
                    </div>
                ) : type === 'textarea' ? (
                    <textarea
                        name={fieldName}
                        value={value || ''}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${error ? 'border-red-500' : ''}`}
                        rows={4}
                        aria-label={label}
                        readOnly={readOnly} // Added readOnly
                    ></textarea>
                ) : type === 'date' ? (
                    <input
                        type="date"
                        name={fieldName}
                        // Format the date value to 'yyyy-MM-dd' for the input field
                        value={value ? value.substring(0, 10) : ''}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${error ? 'border-red-500' : ''}`}
                        aria-label={label}
                        readOnly={readOnly} // Added readOnly
                    />
                ) : (
                    <input
                        type={type}
                        name={fieldName}
                        value={value || ''}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${error ? 'border-red-500' : ''}`}
                        aria-label={label}
                        readOnly={readOnly} // Added readOnly
                    />
                )}

                {error && <p className="text-red-500 text-xs italic">{error}</p>}
            </div>
        );
    };

    const renderFileInput = (name, label, previewKey) => {
        return (
            <ImageUploader
                label={label}
                name={name}
                onChange={handleChange}
                previewUrl={previewImages[previewKey]}
                setPreviewUrl={(url) => setPreviewImages(prev => ({ ...prev, [previewKey]: url }))}
            />
        );
    };

    const renderSection = (sectionComponent, key) => (
        <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {sectionComponent}
        </motion.div>
    );

    const handleDownloadPdf = () => {
        if (!selectedStudent) {
            toast.error("Please select a student first.");
            return;
        }

        try {
            // Create a new div element for the PDF content
            const element = document.createElement('div');
            element.style.padding = '20px';
            element.style.fontFamily = 'sans-serif';

            // School header
            const schoolHeader = document.createElement('h1');
            schoolHeader.style.textAlign = 'center';
            schoolHeader.style.color = '#1e3a8a';
            schoolHeader.textContent = schoolData?.schoolName || 'School Name Not Available';
            element.appendChild(schoolHeader);

            // Title
            const title = document.createElement('p');
            title.style.textAlign = 'center';
            title.style.marginBottom = '20px';
            title.textContent = 'Student Application Form';
            element.appendChild(title);

            // Student Information Section
            const studentSection = document.createElement('h2');
            studentSection.style.color = '#1e3a8a';
            studentSection.style.borderBottom = '1px solid #ccc';
            studentSection.style.paddingBottom = '5px';
            studentSection.style.marginTop = '20px';
            studentSection.textContent = 'Student Information';
            element.appendChild(studentSection);

            // Student details
            const studentDetails = [
                { label: 'Application Number', value: selectedStudent.applicationNumber },
                { label: 'Full Name', value: selectedStudent.name },
                { label: 'Date of Birth', value: selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : 'N/A' },
                { label: 'Gender', value: selectedStudent.gender || 'N/A' },
                { label: 'Class Applied For', value: getClassDisplayString(selectedStudent.classAppliedFor) || 'N/A' }, // Use helper function
                { label: 'Section', value: (selectedStudent.sectionId && selectedStudent.sectionId.name) || selectedStudent.section || 'N/A' },
                { label: 'Email', value: selectedStudent.email || 'N/A' },
                { label: 'Blood Group', value: selectedStudent.bloodGroup || 'N/A' },
                { label: 'Nationality', value: selectedStudent.nationality || 'N/A' },
                { label: 'Religion', value: selectedStudent.religion || 'N/A' },
                { label: 'Place of Birth', value: selectedStudent.placeOfBirth || 'N/A' },
                { label: 'Admission Date', value: selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate).toLocaleDateString() : 'N/A' },
            ];

            studentDetails.forEach(detail => {
                const p = document.createElement('p');
                p.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
                element.appendChild(p);
            });

            // Parent Information Section
            const parentSection = document.createElement('h2');
            parentSection.style.color = '#1e3a8a';
            parentSection.style.borderBottom = '1px solid #ccc';
            parentSection.style.paddingBottom = '5px';
            parentSection.style.marginTop = '20px';
            parentSection.textContent = 'Parent Information';
            element.appendChild(parentSection);

            // Father Details
            if (selectedStudent.parentId?.father?.name) {
                const fatherHeader = document.createElement('h3');
                fatherHeader.style.color = '#1e3a8a';
                fatherHeader.style.marginTop = '15px';
                fatherHeader.textContent = "Father's Details";
                element.appendChild(fatherHeader);

                const fatherDetails = [
                    { label: 'Name', value: selectedStudent.parentId.father.name },
                    { label: 'Email', value: selectedStudent.parentId.father.email || 'N/A' },
                    { label: 'Mobile', value: selectedStudent.parentId.father.mobile || 'N/A' },
                    { label: 'Occupation', value: selectedStudent.parentId.father.occupation || 'N/A' },
                    { label: 'Blood Group', value: selectedStudent.parentId.father.bloodGroup || 'N/A' },
                ];

                fatherDetails.forEach(detail => {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
                    element.appendChild(p);
                });
            }

            // Mother Details
            if (selectedStudent.parentId?.mother?.name) {
                const motherHeader = document.createElement('h3');
                motherHeader.style.color = '#1e3a8a';
                motherHeader.style.marginTop = '15px';
                motherHeader.textContent = "Mother's Details";
                element.appendChild(motherHeader);

                const motherDetails = [
                    { label: 'Name', value: selectedStudent.parentId.mother.name },
                    { label: 'Email', value: selectedStudent.parentId.mother.email || 'N/A' },
                    { label: 'Mobile', value: selectedStudent.parentId.mother.mobile || 'N/A' },
                    { label: 'Occupation', value: selectedStudent.parentId.mother.occupation || 'N/A' },
                    { label: 'Blood Group', value: selectedStudent.parentId.mother.bloodGroup || 'N/A' },
                ];

                motherDetails.forEach(detail => {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
                    element.appendChild(p);
                });
            }

            // Guardian Details (if exists)
            if (selectedStudent.parentId?.guardian?.name) {
                const guardianHeader = document.createElement('h3');
                guardianHeader.style.color = '#1e3a8a';
                guardianHeader.style.marginTop = '15px';
                guardianHeader.textContent = "Guardian's Details";
                element.appendChild(guardianHeader);

                const guardianDetails = [
                    { label: 'Name', value: selectedStudent.parentId.guardian.name },
                    { label: 'Relation', value: selectedStudent.parentId.guardian.relation || 'N/A' },
                    { label: 'Email', value: selectedStudent.parentId.guardian.email || 'N/A' },
                    { label: 'Mobile', value: selectedStudent.parentId.guardian.mobile || 'N/A' },
                    { label: 'Occupation', value: selectedStudent.parentId.guardian.occupation || 'N/A' },
                ];

                guardianDetails.forEach(detail => {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
                    element.appendChild(p);
                });
            }

            // Emergency Contact Section
            const emergencySection = document.createElement('h2');
            emergencySection.style.color = '#1e3a8a';
            emergencySection.style.borderBottom = '1px solid #ccc';
            emergencySection.style.paddingBottom = '5px';
            emergencySection.style.marginTop = '20px';
            emergencySection.textContent = 'Emergency Contact';
            element.appendChild(emergencySection);

            const emergencyDetails = [
                { label: 'Name', value: selectedStudent.parentId?.emergencyContact?.name || 'N/A' },
                { label: 'Relation', value: selectedStudent.parentId?.emergencyContact?.relation || 'N/A' },
                { label: 'Phone', value: selectedStudent.parentId?.emergencyContact?.phone || 'N/A' },
            ];

            emergencyDetails.forEach(detail => {
                const p = document.createElement('p');
                p.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
                element.appendChild(p);
            });

            // Medical Information Section (if exists)
            if (selectedStudent.medicalInfo?.hasCondition) {
                const medicalSection = document.createElement('h2');
                medicalSection.style.color = '#1e3a8a';
                medicalSection.style.borderBottom = '1px solid #ccc';
                medicalSection.style.paddingBottom = '5px';
                medicalSection.style.marginTop = '20px';
                medicalSection.textContent = 'Medical Information';
                element.appendChild(medicalSection);

                const medicalDetails = [
                    { label: 'Medical Condition', value: selectedStudent.medicalInfo.hasCondition ? 'Yes' : 'No' },
                    { label: 'Needs Urgent Care', value: selectedStudent.medicalInfo.needsUrgentCare ? 'Yes' : 'No' },
                    { label: 'Condition Details', value: selectedStudent.medicalInfo.conditionDetails || 'N/A' },
                    { label: 'School Support Needed', value: selectedStudent.medicalInfo.schoolSupportNeeded || 'N/A' },
                    { label: 'Blood Group', value: selectedStudent.medicalInfo.bloodGroup || 'N/A' },
                ];

                medicalDetails.forEach(detail => {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
                    element.appendChild(p);
                });
            }

            // Append the element to the body temporarily
            document.body.appendChild(element);

            // PDF options
            const options = {
                margin: 10,
                filename: `Student_Application_${selectedStudent.applicationNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    logging: true,
                    useCORS: true,
                    allowTaint: true
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };

            console.log('Generating PDF for student:', selectedStudent);
            console.log('Using html2pdf options:', options);
            console.log('HTML element content:', element.innerHTML); // Log the generated HTML content

            // Generate PDF
            html2pdf()
                .set(options)
                .from(element)
                .save()
                .then(() => {
                    // console.log('PDF generated successfully');
                    toast.success('PDF generated successfully!'); // Add a success toast
                })
                .catch(err => {
                    console.error('Error generating PDF:', err);
                    // Provide more specific error details if available
                    const errorMessage = err.message || 'Unknown error';
                    toast.error(`Failed to generate PDF. Error: ${errorMessage}. Please check the browser console for more details.`);
                })
                .finally(() => {
                    // Remove the temporary element
                    if (element.parentNode === document.body) {
                        document.body.removeChild(element);
                    }
                });

        } catch (error) {
            console.error('Error in PDF generation:', error);
            const errorMessage = error.message || 'Unknown error';
            toast.error(`An error occurred while generating the PDF. Error: ${errorMessage}. Please check the browser console for more details.`);
        }
    };


    if (isLoading) {
        return (
            <div className="text-center mt-5">
                <div className="animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent text-red-500" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2 text-gray-600">Loading students data...</p>
            </div>
        );
    }

    if (error) {
        return <div className="min-h-screen bg-gray-100 p-8 text-center text-red-500">Error loading data: {error}</div>;
    }


    return (
        <div className="container mx-auto mt-4 p-4">
            <h2 className="text-2xl font-bold mb-4">Update Student Information</h2>

            {Object.keys(errors).length > 0 && (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100" role="alert">
                    <span className="font-medium">Please correct the following errors:</span>
                    <ul className="mt-1.5 ml-4 list-disc list-inside">
                        {Object.entries(errors).map(([field, error]) => (
                            <li key={field}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {!selectedStudent ? (
                // Display list of students with search and filter
                <div className="bg-white shadow-md rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-200 rounded-t-lg bg-red-600 text-white">
                        <h4 className="text-lg font-semibold">Select a Student to Update</h4>
                    </div>
                    <div className="p-4">
                        {/* Search and Filter Controls */}
                        <div className="flex flex-wrap mb-4 -mx-2">
                            <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                                <input
                                    type="text"
                                    placeholder="Search by Name, Application No., or Email"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                                <select
                                    value={filterClass}
                                    onChange={(e) => setFilterClass(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    disabled={classesLoading}
                                >
                                    <option value="">Filter by Class</option>
                                    {Array.isArray(classes) && classes.map(cls => (
                                        cls && cls._id && cls.className && (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.className}
                                            </option>
                                        )
                                    ))}
                                    {classesLoading && <option>Loading classes...</option>}
                                    {!classesLoading && (!Array.isArray(classes) || classes.length === 0) && (
                                        <option disabled>No classes available</option>
                                    )}
                                </select>
                            </div>
                            <div className="w-full md:w-1/3 px-2">
                                <select
                                    value={filterSection}
                                    onChange={(e) => setFilterSection(e.target.value)}
                                >
                                    <option value="">Filter by Section</option>
                                    {[...new Set(students
                                        .map(s => s.sectionId?.name || s.section)
                                        .filter(Boolean)
                                    )].sort().map(name => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Filtered Students List */}
                        {filteredStudents.length === 0 ? (
                            <p className="text-gray-600">No students found matching your criteria.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application No.</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {/* Render filtered students */}
                                        {filteredStudents.map(student => (
                                            <tr key={student._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.profilePhoto && (
                                                      <div className="relative group inline-block">
                                                        <img 
                                                          src={getAbsoluteUrl(student.profilePhoto)} 
                                                          alt="Profile" 
                                                          className="w-10 h-10 rounded-full object-cover border"
                                                          onError={(e)=>{e.currentTarget.style.display='none'}}
                                                        />
                                                        <div className="absolute z-50 hidden group-hover:block -top-2 left-12">
                                                          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                                          <img 
                                                            src={getAbsoluteUrl(student.profilePhoto)} 
                                                            alt="Profile Large" 
                                                            className="w-40 h-40 rounded-lg object-cover border shadow-xl bg-white"
                                                            onError={(e)=>{e.currentTarget.style.display='none'}}
                                                          />
                                                        </div>
                                                      </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.applicationNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.classId?.className || getClassDisplayString(student.classAppliedFor) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.sectionId?.name || student.section || 'N/A'}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        className="text-red-600 hover:text-red-900 mr-4" // Added margin for spacing
                                                        onClick={() => handleSelectStudent(student)}
                                                    >
                                                        Select
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                                                        onClick={() => openDeleteModal(student._id)} // Open modal with student ID
                                                        disabled={isSubmitting} // Disable while submitting
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // Display update form for selected student
                <form onSubmit={handleSubmit}>
                    <button
                        type="button"
                        className="mb-4 px-4 py-2 rounded-md font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:shadow-outline"
                        onClick={() => setSelectedStudent(null)} // Button to go back to list
                    >
                        Back to Student List
                    </button> {/* Closing tag added */}

                    {/* Download PDF Button */}
                    <button
                        type="button"
                        className="mb-4 ml-4 px-4 py-2 rounded-md font-semibold bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:shadow-outline"
                        onClick={handleDownloadPdf}
                        disabled={!schoolData} // Disable if school data is not loaded
                    >
                        Download Application PDF
                    </button>


                    {renderSection(<StudentBasicInfoSection
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                        previewImages={previewImages}
                        renderField={renderField}
                        renderFileInput={renderFileInput}
                        sections={sections.map(s => s.name)}
                    />, 'basic')}

                    {renderSection(<StudentAcademicInfoSection
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                        renderField={renderField}
                    />, 'academic')}

                    {renderSection(<MedicalInfoSection
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                        renderField={renderField}
                    />, 'medical')}

                    {renderSection(<ParentInfoSection
                        parentType="father"
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                        previewImages={previewImages}
                        renderField={renderField}
                        renderFileInput={renderFileInput}
                    />, 'father')}

                    {renderSection(<ParentInfoSection
                        parentType="mother"
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                        previewImages={previewImages}
                        renderField={renderField}
                        renderFileInput={renderFileInput}
                    />, 'mother')}

                    {renderSection(<ParentInfoSection
                        parentType="guardian"
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                        previewImages={previewImages}
                        renderField={renderField}
                        renderFileInput={renderFileInput}
                    />, 'guardian')}

                    {renderSection(<EmergencyContactSection
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                        renderField={renderField}
                    />, 'emergency')}

                    <div className="flex justify-between mb-4">
                        {/* Removed Reset button as it's less relevant in this flow */}

                        <button
                            type="submit"
                            className="px-6 py-3 text-lg rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:shadow-outline"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin inline-block w-4 h-4 border-2 rounded-full border-t-transparent text-white mr-2" role="status" aria-hidden="true"></span>
                                    Updating...
                                </>
                            ) : 'Update Student & Parent Information'}
                        </button>
                    </div>
                </form>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                itemToDelete={itemToDeleteId}
            />
        </div>
    );

};

export default UpdateStudent;
