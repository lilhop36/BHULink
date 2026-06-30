import React, { useEffect, useState } from 'react';
import { MdLibraryBooks, MdDescription, MdLink, MdDownload } from 'react-icons/md';
import { getResourcesByFaculty } from '../services/resourceService';

const FacultyResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all faculty resources for students to view
    const allFacultyResources = getResourcesByFaculty(null); // null means get all faculty resources
    setResources(allFacultyResources);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading faculty resources...</div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-2 mb-6">
        <MdLibraryBooks className="text-amber-400 text-2xl" />
        <h2 className="text-2xl font-bold text-white">Faculty Resources</h2>
        <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm">
          {resources.length} available
        </span>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MdLibraryBooks className="text-5xl mx-auto mb-4 opacity-50" />
          <p className="text-lg">No faculty resources available yet</p>
          <p className="text-sm mt-2">Check back later for new resources from your faculty</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white/5 rounded-xl p-4 border border-white/20 hover:bg-white/10 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MdDescription className="text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
                  </div>
                  <p className="text-gray-300 mb-3">{resource.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      {resource.facultyName}
                    </span>
                    <span>Shared on {new Date(resource.createdAt).toLocaleDateString()}</span>
                  </div>

                  {resource.fileData ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={resource.fileData}
                        download={resource.fileName}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <MdDownload />
                        <span>Download {resource.fileName}</span>
                      </a>
                      <span className="text-xs text-gray-400">
                        ({resource.fileName})
                      </span>
                    </div>
                  ) : resource.link && resource.link !== '#' && (
                    <div className="flex items-center gap-2">
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <MdLink />
                        <span>View Resource</span>
                      </a>
                      <span className="text-xs text-gray-400">External link</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyResources;
