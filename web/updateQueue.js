const fs = require('fs');
let code = fs.readFileSync('src/pages/auditor/AuditQueue.tsx', 'utf8');

code = code.replace(
`                        status: displayStatus,
                        originalQuantity: entry.quantityTonnes
                    };`,
`                        status: displayStatus,
                        originalQuantity: entry.quantityTonnes,
                        emissionSource: entry.emissionSource,
                        location: entry.location,
                        notes: entry.notes
                    };`
);

const startMarker = "{/* ─── INDUSTRY DATA TAB ─── */}";
const endMarker = "{/* ─── AI ANALYSIS TAB ─── */}";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const leftPart = code.substring(0, startIndex);
    const rightPart = code.substring(endIndex);
    const newTab = `{/* ─── INDUSTRY DATA TAB ─── */}
                        {rightTab === 'industry' && (
                            <div className="space-y-6">
                                {/* Basic Summary Bar */}
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Emission Summary</p>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-3xl font-black text-[#1A7A4A]">{selected.originalQuantity?.toLocaleString() || '0'}</p>
                                            <p className="text-xs text-gray-400 font-bold mt-1">TOTAL tCO₂e</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="text-sm font-bold text-gray-700">{selected.emissionSource || 'General Source'}</p>
                                            <p className="text-xs text-gray-400 mt-1">Primary Source</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div>
                                    <h3 className="font-black text-gray-900 mb-3">Submission Details</h3>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-sm">
                                        <div className="flex p-3">
                                            <span className="w-1/3 text-gray-500 font-medium">Location</span>
                                            <span className="w-2/3 text-gray-900 font-bold">{selected.location || 'Not specified'}</span>
                                        </div>
                                        <div className="flex p-3">
                                            <span className="w-1/3 text-gray-500 font-medium">Notes & Evidence</span>
                                            <span className="w-2/3 text-gray-900">{selected.notes || 'No notes provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-blue-600">info</span>
                                        <h3 className="font-black text-blue-900">Note for Auditor</h3>
                                    </div>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        This is a preliminary queue preview. Click "Start Review & Verify" below to see the full submission details, document checklist, and to submit your final decision.
                                    </p>
                                </div>
                            </div>
                        )}

                        `;
    code = leftPart + newTab + rightPart;
    fs.writeFileSync('src/pages/auditor/AuditQueue.tsx', code);
    console.log('Successfully updated AuditQueue.tsx');
} else {
    console.log('Markers not found', startIndex, endIndex);
}
